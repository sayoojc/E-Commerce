const adminModel = require('../../models/adminModel');
const { render } = require('ejs');3
const Order = require('../../models/orderModel');
const moment = require('moment');
const Product = require('../../models/productModel'); 


//Get Controll

exports.getAdminLogin = (req,res,next) => {
  res.render("user/adminLogin", { error: '' });
};





exports.getAdminDashboard = async (req, res, next) => {
  try {
    if (req.session.admin) {
      // Fetch orders from the database
      const orders = await Order.find();

      // Initialize data structures
      const salesData = {
        yearly: { labels: moment.months(), data: Array(12).fill(0) },
        monthly: { labels: Array.from({ length: moment().daysInMonth() }, (_, i) => i + 1), data: Array(moment().daysInMonth()).fill(0) },
        weekly: { labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], data: Array(7).fill(0) },
        daily: { labels: Array.from({ length: 24 }, (_, i) => `${i}:00`), data: Array(24).fill(0) }
      };

      const productsData = { yearly: {}, monthly: {}, weekly: {}, daily: {} };
      const categoriesData = { yearly: {}, monthly: {}, weekly: {}, daily: {} };

      for (const order of orders) {
        const orderDate = moment(order.orderDate);

        // Yearly sales data
        const orderMonth = orderDate.month();
        salesData.yearly.data[orderMonth] += order.cartValue;

        // Monthly sales data (for the current month)
        if (orderDate.isSame(moment(), 'month')) {
          const orderDay = orderDate.date() - 1;
          salesData.monthly.data[orderDay] += order.cartValue;
        }

        // Weekly sales data (for the current week)
        if (orderDate.isSame(moment(), 'week')) {
          const orderDayOfWeek = orderDate.day();
          salesData.weekly.data[orderDayOfWeek] += order.cartValue;
        }

        // Daily sales data (for the current day)
        if (orderDate.isSame(moment(), 'day')) {
          const orderHour = orderDate.hour();
          salesData.daily.data[orderHour] += order.cartValue;
        }

        // Process each item in the order
        for (const item of order.products) {
          try {
            // Find the product using productId to get categoryName
            const product = await Product.findById(item.productId).populate('category');

            if (product) {
              // Process products data
              if (!productsData.yearly[item.productName]) productsData.yearly[item.productName] = 0;
              productsData.yearly[item.productName] += item.count;

              if (orderDate.isSame(moment(), 'month')) {
                if (!productsData.monthly[item.productName]) productsData.monthly[item.productName] = 0;
                productsData.monthly[item.productName] += item.count;
              }

              if (orderDate.isSame(moment(), 'week')) {
                if (!productsData.weekly[item.productName]) productsData.weekly[item.productName] = 0;
                productsData.weekly[item.productName] += item.count;
              }

              if (orderDate.isSame(moment(), 'day')) {
                if (!productsData.daily[item.productName]) productsData.daily[item.productName] = 0;
                productsData.daily[item.productName] += item.count;
              }

              // Process categories data
              const category = product.category.categoryName;
              
              if (!categoriesData.yearly[category]) categoriesData.yearly[category] = 0;
              categoriesData.yearly[category] += item.count;

              if (orderDate.isSame(moment(), 'month')) {
                if (!categoriesData.monthly[category]) categoriesData.monthly[category] = 0;
                categoriesData.monthly[category] += item.count;
              }

              if (orderDate.isSame(moment(), 'week')) {
                if (!categoriesData.weekly[category]) categoriesData.weekly[category] = 0;
                categoriesData.weekly[category] += item.count;
              }

              if (orderDate.isSame(moment(), 'day')) {
                if (!categoriesData.daily[category]) categoriesData.daily[category] = 0;
                categoriesData.daily[category] += item.count;
              }
            }
          } catch (error) {
            console.error(`Error fetching product with ID ${item.productId}: ${error.message}`);
          }
        }
      }

      // Prepare chart data
      const productsChartData = {
        yearly: { labels: Object.keys(productsData.yearly), data: Object.values(productsData.yearly) },
        monthly: { labels: Object.keys(productsData.monthly), data: Object.values(productsData.monthly) },
        weekly: { labels: Object.keys(productsData.weekly), data: Object.values(productsData.weekly) },
        daily: { labels: Object.keys(productsData.daily), data: Object.values(productsData.daily) }
      };

      const categoriesChartData = {
        yearly: { labels: Object.keys(categoriesData.yearly), data: Object.values(categoriesData.yearly) },
        monthly: { labels: Object.keys(categoriesData.monthly), data: Object.values(categoriesData.monthly) },
        weekly: { labels: Object.keys(categoriesData.weekly), data: Object.values(categoriesData.weekly) },
        daily: { labels: Object.keys(categoriesData.daily), data: Object.values(categoriesData.daily) }
      };

      // Pass the chart data to the view
      res.render("user/adminDashboard", {
        salesData,
        productsChartData,
        categoriesChartData
      });
    } else {
      res.redirect('/admin/adminLogin');
    }
  } catch (error) {
    console.error('Error in getAdminDashboard:', error);
    res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
  }
};




exports.getTopProducts = async (req, res, next) => {
  try {
    const { filter } = req.query;
    let matchCondition = {};

    // Adjust the match condition based on the filter
    if (filter === 'monthly') {
      matchCondition = {
        orderDate: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) }
      };
    } else if (filter === 'weekly') {
      matchCondition = {
        orderDate: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
      };
    } else {
      matchCondition = {
        orderDate: { $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) }
      };
    }

    const orders = await Order.aggregate([
      { $match: matchCondition },
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.productName",
          totalSold: { $sum: "$products.count" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]);

    res.json({ topProducts: orders });
  } catch (error) {
    console.error('Error in getTopProducts:', error);
    res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
  }
};


///post controll//

exports.postAdminLogin =  (req,res,next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    let email1=process.env.admin_email
    let password1=process.env.admin_pass
   
    if(email === email1 && password1 === password){
     req.session.admin = email;
        res.redirect("Dashboard")
    }else {
     res.redirect('adminLogin');
    }
  } catch (error) {
    console.error('Error in postAdminLogin:', error);
    res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
  }

};

exports.postAdminLogout = (req,res,next) => {
  try {
    req.session.destroy((err) => {
      if(err){
        
        res.send('Error');
      }else{
        res.redirect("adminLogin");
      }
    }); 
  } catch (error) {
    console.error('Error in postAdminLogout:', error);
    res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
  }

  
};


























