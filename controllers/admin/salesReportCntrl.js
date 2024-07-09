const orderModel = require('../../models/orderModel');

const userModel = require('../../models/userModel');

const moment = require('moment');

const path=require('path');
const fs=require('fs')


exports.getSalesReport = async (req, res, next) => {
    try {
        const { startDate, endDate, filterOption } = req.query;

        // Determine the date range based on the filterOption
        let start, end;
        if (startDate && endDate) {
            start = new Date(startDate);
            end = new Date(endDate);
        }
        else if (filterOption === 'weekly') {
            start = moment().startOf('week').toDate();
            end = moment().endOf('week').toDate();
        } else if (filterOption === 'monthly') {
            start = moment().startOf('month').toDate();
            end = moment().endOf('month').toDate();
        } else  if (filterOption === 'daily') {
            start = moment().startOf('day').toDate();
            end = moment().endOf('day').toDate();
        }  else {
            start = new Date(0);  // default to epoch start if no dates are provided
            end = new Date();     // default to now if no dates are provided
        }

        // Create a query object to hold the date range
        let query = {
            orderDate: {
                $gte: start,
                $lte: end
            }
        };

        // Fetch all orders within the date range
       
        // Fetch non-cancelled orders within the date range
        const orders = await orderModel.find({
            ...query,
            'orders.orderStatus': { $ne: 'Cancelled' }
        })    .populate('user')
       
        console.log('orders',orders);
        // Step 2: Extract unique user IDs
        const uniqueUserIds = new Set(orders
            .filter(order => order.user !== null) // Ensure user is not null
            .map(order => order.user.toString())
        );
const orders1 = orders.sort((a,b) => b.orderDate-a.orderDate);
        // Step 3: Get the unique user count
        const uniqueUserCount = uniqueUserIds.size;

        // Calculate total order amount
        const totalOrderAmount = orders.reduce((acc, curr) => acc + curr.payment.amount, 0);
        console.log('the total order amount:',totalOrderAmount);

        res.render('user/salesReport', { orders1, totalOrderAmount, uniqueUserCount,start,end });

    } catch (error) {
        console.error('Error in getSalesReport:', error);
        res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
    }
};



const PDFDocument2=require('pdfkit-table');

exports.getSalesReportPdf=async (req,res,next)=>{

    try{
        let { startDate, endDate, filterOption } = req.query;
        let ordersQuery = {};
        let sum=0;
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
        const orders = await orderModel.find(ordersQuery).populate("user").sort({ orderDate: -1 });
        const totalCount = await orderModel.countDocuments(ordersQuery);
        let totalAmount = await orderModel.aggregate([
            {
            $match: ordersQuery,
            },
            {
            $group: {
                _id: null,
                totalAmount: { $sum: "$payment.amount" },
            },
            },
            {
                $project:{
                    _id:0
                }
            }
        ]);
        let totalUser = await orderModel.aggregate([
            {
              $match: ordersQuery
            },
            {
              $group: { _id: "$user" }
            },
            {
              $count: "uniqueUsers"
            }
          ]);
          
          const uniqueUserCount = totalUser.length > 0 ? totalUser[0].uniqueUsers : 0;
        console.log('total user',totalUser);


        totalAmount= (totalAmount.length>0) ? totalAmount[0].totalAmount : 0
        totalUser=totalUser.length>0 ? totalUser[0].count : 0
 
        const doc = new PDFDocument2;
        const salesReportPdfName='salesReport-'+Date.now()+'.pdf';
        const salesReportPdfPath=path.join('data','salesReportPdf',salesReportPdfName)
       
        res.setHeader('Content-Type','application/pdf')
        res.setHeader('Content-Disposition','inline;filename="'+salesReportPdfName+'"') //change 'inline' to attatchment to download directly
        
        doc.pipe(fs.createWriteStream(salesReportPdfPath))

        doc.pipe(res)
    
        // Add content to PDF
        doc.fontSize(20).text('Sales Report', { align: 'center' });
        doc.moveDown();

        doc.fontSize(15).text(`Overall Sales Count: ${totalCount}`);
        doc.moveDown();

        doc.fontSize(15).text(`Overall Order Amount: ${totalAmount.toFixed(2)}`);
        doc.moveDown();

        doc.fontSize(15).text(`Total Users: ${uniqueUserCount}`);
        doc.moveDown(2);

        // Prepare table data
        const table = {
            headers: [
                'Order ID', 'Name', 'Products', 'Total Quantity', 'Total Price', 'Address', 'Payment Method', 'Order Date'
            ],
            rows: orders.map(order => {
                sum=0;
                let totalQuantity = 0;
                const products = order.products.map(item => {
                    totalQuantity+=item.count;
                    if(item.orderStatus==="cancelled"){
                        return `${item.productName}(cancelled) - ${item.count}`
                    }else if(item.orderStatus==="returned"){
                        return `${item.productName}(returned) - ${item.count}`
                    }else{
                        sum+=item.discountPrice
                        return `${item.productName} - ${item.count}`
                    }
                    
                }).join(', ');
                const address = `${order.address.address1}, ${order.address.address2}, ${order.address.phone}, ${order.address.locality}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}`;
                if(order.coupon.discount){
                    sum=(sum*(1-order.coupon.discount/100)).toFixed(2);
                }else{
                    sum=sum.toFixed(2);
                }
                return [
                    order._id,
                    order.user.name,
                    products,
                    totalQuantity,
                    order.payment.amount,
                    address,
                    order.payment.paymentType,
                    order.orderDate.toISOString().split('T')[0] // Format as YYYY-MM-DD
                ];
            })
        };

        // Add table to PDF
        doc.table(table, {
            prepareHeader: () => doc.font('Helvetica-Bold').fontSize(10),
            prepareRow: (row, i) => doc.font('Helvetica').fontSize(10)
        });

        // Finalize the PDF and end the stream
        doc.end();


    }catch (error) {
        
        console.log(error)
    }

}






const ExcelJS = require('exceljs');


exports.generateExcel = async (req, res, next) => {
    const { start, end } = req.params;

    // Parse the date strings to Date objects
    const startDate = new Date(start);
    const endDate = new Date(end);

    // Create a query object to hold the date range
    const query = {
        orderDate: {
            $gte: startDate,
            $lte: endDate
        }
    };

    try {
        // Fetch all orders within the date range
        const orders = await orderModel.find(query)
            .populate('user')
            .exec();

        // Fetch non-cancelled orders within the date range
        const orders1 = await orderModel.find({
            ...query,
            'products.orderStatus': { $ne: 'cancelled' }
        })
            .populate('user')
            .exec();

        // Extract unique user IDs
        const uniqueUserIds = new Set(orders1
            .filter(order => order.user !== null)
            .map(order => order.user.toString())
        );

        // Get the unique user count
        const uniqueUserCount = uniqueUserIds.size;

        // Calculate total order amount
        const totalOrderAmount = orders1.reduce((acc, curr) => acc + curr.cartValue, 0);

        // Create a new workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Orders Report');

        // Add title row
        worksheet.mergeCells('A1', 'G1');
        const titleRow = worksheet.getCell('A1');
        titleRow.value = 'Orders Report';
        titleRow.font = { size: 20, bold: true };
        titleRow.alignment = { vertical: 'middle', horizontal: 'center' };

        // Add date range row
        worksheet.mergeCells('A2', 'G2');
        const dateRangeRow = worksheet.getCell('A2');
        dateRangeRow.value = `Date Range: ${moment(startDate).format('YYYY-MM-DD')} to ${moment(endDate).format('YYYY-MM-DD')}`;
        dateRangeRow.font = { size: 12 };
        dateRangeRow.alignment = { vertical: 'middle', horizontal: 'center' };

        worksheet.addRow([]);

        // Add statistics
        worksheet.addRow(['Total Orders', orders.length]);
        worksheet.addRow(['Total Non-Cancelled Orders', orders1.length]);
        worksheet.addRow(['Unique Users', uniqueUserCount]);
        worksheet.addRow(['Total Order Amount', `$${totalOrderAmount.toFixed(2)}`]);

        worksheet.addRow([]);

        // Add header row for order details
        const header = ['Order ID', 'User', 'Products', 'Total Quantity', 'Order Amount', 'Discount Amount', 'Address', 'Order Date'];
        worksheet.addRow(header);

        // Add order details
        orders1.forEach(order => {
            const products = order.products.map(item => `${item.productName} (Count: ${item.count}, Price: $${item.price.toFixed(2)})`).join(', ');
            worksheet.addRow([
                order._id.toString(),
                order.user ? order.user.name : 'N/A',
                products,
                order.products.reduce((acc, item) => acc + item.count, 0),
                `$${order.cartValue.toFixed(2)}`,
                `$${order.discountAmount.toFixed(2)}`,
                `${order.address.address1}, ${order.address.address2}, ${order.address.phone}, ${order.address.locality}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}`,
                moment(order.orderDate).format('YYYY-MM-DD')
            ]);
        });

        // Format the header row
        worksheet.getRow(8).font = { bold: true };

        // Adjust column widths
        worksheet.columns.forEach(column => {
            if (column.header) {
                column.width = column.header.length < 20 ? 20 : column.header.length;
            }
        });

        // Write to buffer
        const buffer = await workbook.xlsx.writeBuffer();

        // Send the buffer as a downloadable Excel file
        res.writeHead(200, {
            'Content-Length': buffer.length,
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename=orders_report.xlsx'
        }).end(buffer);
    } catch (error) {
        console.error('Error in generateExcel:', error);
        res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
    }
};
