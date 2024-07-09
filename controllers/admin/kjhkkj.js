const PDFDocument = require('pdfkit-table');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const Order = require('./models/Order'); // Assuming your Order model is imported correctly

exports.getSalesReportPdf = async (req, res, next) => {
    try {
        let { startDate, endDate, filterOption } = req.query;
        let ordersQuery = {};
        let sum = 0;

        if (startDate && endDate) {
            ordersQuery.orderDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        } else if (filterOption) {
            const today = moment().startOf('day');
            switch (filterOption) {
                case 'daily':
                    startDate = today;
                    endDate = moment(today).endOf('day');
                    break;
                case 'weekly':
                    startDate = moment(today).startOf('isoWeek');
                    endDate = moment(today).endOf('isoWeek');
                    break;
                case 'monthly':
                    startDate = moment(today).startOf('month');
                    endDate = moment(today).endOf('month');
                    break;
            }
            ordersQuery.orderDate = {
                $gte: startDate.toDate(),
                $lte: endDate.toDate()
            };
        }

        const orders = await Order.find(ordersQuery).populate("userId").sort({ createdAt: -1 });
        const totalCount = await Order.countDocuments(ordersQuery);
        let totalAmount = await Order.aggregate([
            {
                $match: ordersQuery,
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$totalPrice" },
                },
            },
            {
                $project: {
                    _id: 0
                }
            }
        ]);
        let totalUser = await Order.aggregate([
            {
                $match: ordersQuery
            }, {
                $group: { _id: "$userId", count: { $sum: 1 } }
            },
            { $project: { _id: 0 } }
        ]);

        totalAmount = (totalAmount.length > 0) ? totalAmount[0].totalAmount : 0;
        totalUser = totalUser.length > 0 ? totalUser[0].count : 0;

        const doc = new PDFDocument;
        const salesReportPdfName = 'salesReport-' + Date.now() + '.pdf';
        const salesReportPdfPath = path.join('data', 'salesReportPdf', salesReportPdfName);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline;filename="' + salesReportPdfName + '"'); // Change 'inline' to 'attachment' to download directly

        doc.pipe(fs.createWriteStream(salesReportPdfPath));
        doc.pipe(res);

        // Add content to PDF
        doc.fontSize(20).text('Sales Report', { align: 'center' });
        doc.moveDown();

        doc.fontSize(15).text(`Overall Sales Count: ${totalCount}`);
        doc.moveDown();

        doc.fontSize(15).text(`Overall Order Amount: $${totalAmount.toFixed(2)}`);
        doc.moveDown();

        doc.fontSize(15).text(`Total Users: ${totalUser}`);
        doc.moveDown(2);

        // Prepare table data
        const table = {
            headers: [
                'Order ID', 'Name', 'Products', 'Total Quantity', 'Total Price', 'Address', 'Payment Method', 'Order Date'
            ],
            rows: orders.map(order => {
                sum = 0;
                const products = order.items.map(item => {
                    if (item.status === "cancelled") {
                        return `${item.productName} (cancelled) - ${item.quantity}`;
                    } else if (item.status === "returned") {
                        return `${item.productName} (returned) - ${item.quantity}`;
                    } else {
                        sum += item.discountPrice;
                        return `${item.productName} - ${item.quantity}`;
                    }
                }).join(', ');

                const address = `${order.address.name}, ${order.address.phoneNo}, ${order.address.address}, ${order.address.locality}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}`;

                if (order.coupon.discount) {
                    sum = (sum * (1 - order.coupon.discount / 100)).toFixed(2);
                } else {
                    sum = sum.toFixed(2);
                }

                return [
                    order.orderId,
                    order.userId.name,
                    products,
                    order.totalQuantity,
                    `$${sum}`,
                    address,
                    order.paymentMethod,
                    order.orderDate.toISOString().split('T')[0] // Format as YYYY-MM-DD
                ];
            })
        };

        // Add table to PDF
        doc.table(table.rows, {
            headers: table.headers,
            prepareHeader: () => doc.font('Helvetica-Bold').fontSize(10),
            prepareRow: (row, i) => doc.font('Helvetica').fontSize(10)
        });

        // Finalize the PDF and end the stream
        doc.end();

    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
};
