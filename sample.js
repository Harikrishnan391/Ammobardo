 // Verifies user login credentials and handles OTP.
 verifyToLogin: async (req, res) => {
  try {
    
    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findOne({ email: email });

    if (user) {
      if (user.blocked) {
        res.render("login", {
          message: "User is blocked. Please contact the administrator for assistance.",
        });
      } else {
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
          if (user.is_verified === 0) {
            const otp = await otpController.sendOTP(user.mobile); // Send OTP to the user's mobile number
            await User.updateOne({ _id: user._id }, { otp: otp }); // Store the OTP in the user's record
            req.session.user_id = user._id;
            res.render("otp", {
              message: "Please enter the OTP sent to your mobile number",
            });
          } else {
            req.session.user_id = user._id;
            res.redirect("/home");
         
          }
        } else {
          res.render("login", { message: "Email or password is incorrect" });
         
        }
      }
    } else {
      res.render("login", { message: "Email or password is incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
},




const verifyOTP = async (req, res) => {
  try {
    const enteredOTP = req.body.otp;
    const user = await User.findOne({ _id: req.session.user_id });

    if (user) {
      if (enteredOTP === user.otp) {
        // OTP is correct
        await User.updateOne({ _id: req.session.user_id }, { otp: null,is_verified:1});
        req.session.user_id = user._id;
        res.render('/home');
      } else {
        res.render('otp', { message: 'Invalid OTP. Please try again.' });
      }
    } else {
      res.render('otp', { message: 'User not found. Please try again.' });
    }
  } catch (error) {
    console.log(error.message);

  }
};



//adminHome
<!-- <h1>Welcome</h1>

<a href="/admin/logout">Logout</a> -->

<%-include('../layouts2/header.ejs')%>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<section class="content-main">
    <div class="content-header">
      <div>
        <h2 class="content-title card-title">Dashboard</h2>
        <p>Whole data about your business here</p>
      </div>
      <div>
        <a href="#" class="btn btn-primary"><i class="text-muted material-icons md-post_add"></i>Create report</a>
      </div>
    </div>
    <div class="row">
      <div class="col-lg-3">
        <div class="card card-body mb-4">
          <article class="icontext">
            <span class="icon icon-sm rounded-circle bg-primary-light"><i
                class="text-primary material-icons md-monetization_on"></i></span>
            <div class="text">
              <h6 class="mb-1 card-title">Revenue</h6>
              <span>₹<%= orders[0].totalPriceSum.toFixed(2) %></span>
              
            </div>
          </article>
        </div>
      </div>
      <div class="col-lg-3">
        <div class="card card-body mb-4">
          <article class="icontext">
            <span class="icon icon-sm rounded-circle bg-success-light"><i
                class="text-success material-icons md-local_shipping"></i></span>
            <div class="text">
              <h6 class="mb-1 card-title">Orders</h6>
              <span><%= orders[0].count %></span>
            </div>
          </article>
        </div>
      </div>
      <div class="col-lg-3">
        <div class="card card-body mb-4">
          <article class="icontext">
            <span class="icon icon-sm rounded-circle bg-warning-light"><i
                class="text-warning material-icons md-qr_code"></i></span>
            <div class="text">
              <h6 class="mb-1 card-title">Products</h6>
              <span><%= productsCount %></span>
              <span class="text-sm">in <%= categoryCount %> categories</span>
            </div>
          </article>
        </div>
      </div>
      <div class="col-lg-3">
        <div class="card card-body mb-4">
          <article class="icontext">
            <span class="icon icon-sm rounded-circle bg-info-light"><i
                class="text-info material-icons md-shopping_basket"></i></span>
            <div class="text">
              <h6 class="mb-1 card-title">Online Earning</h6>
          
            </div>
          </article>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-xl-8 col-lg-12">
        <div class="card mb-4">
          <article class="card-body">
            <h5 class="card-title">Sale statistics</h5>
            <canvas id="myChart" height="120px"></canvas>
          </article>
        </div>
      </div>
      <div class="col-xl-4 col-lg-12">
        <div class="card mb-4">
          <article class="card-body">
            <h5 class="card-title">Orders based on date</h5>
            <canvas id="myChart2" height="217"></canvas>
          </article>
        </div>
      </div>
    </div>
    <div class="card mb-4">
      <header class="card-header">
        <h4 class="card-title">Latest orders</h4>
      </header>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table align-middle table-nowrap mb-0" id="myTable">
            <thead>
              <tr>
                <th>#ID</th>
                <th scope="col">Name</th>
                <th scope="col">Total</th>
                <th scope="col">Status</th>
                <th scope="col">Date</th>
              </tr>
            </thead>
            <tbody>
              <% order.forEach(function(order) { %>
              <tr>
                <td><%= order._id %></td>
                <td><b><%= order.addressDetails.name %></b></td>
                <td>₹<%= order.total.toFixed(2) %></td>
                <td>
                  <% switch (order.status) {
                     case 'Placed':
                       %><div class="badge rounded-pill alert-primary"><%= order.status %></div><%
                       break;
                     case 'Dispatched':
                       %><div class="badge rounded-pill alert-info"><%= order.status %></div><%
                       break;
                     case 'Cancel Requested':
                       %><div class="badge rounded-pill alert-warning"><%= order.status %></div><%
                       break;
                     case 'Delivered':
                       %><div class="badge rounded-pill alert-success"><%= order.status %></div><%
                       break;
                     case 'Return Requested':
                       %><div class="badge rounded-pill alert-warning"><%= order.status %></div><%
                       break;
                     default:
                       %><div class="badge rounded-pill alert-danger"><%= order.status %></div><%
                       break;
                   } %>
                </td>
                <td><%= order.createdAt.toLocaleString() %></td>
              </tr>
              <% }) %>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
<footer class="main-footer font-xs">
    <div class="row pb-30 pt-15">
        <div class="col-sm-6">
            <script>
                document.write(new Date().getFullYear())
            </script> ©, Evara - HTML Ecommerce Template .
        </div>
        <div class="col-sm-6">
            <div class="text-sm-end">
                All rights reserved
            </div>
        </div>
    </div>
</footer>
</main>

<script>
    const salesData = JSON.parse('<%- JSON.stringify(salesData) %>');
    console.log("salesdata", salesData);

    const dates = salesData.map(item => item._id);
    const dailySales = salesData.map(item => item.dailySales);
    console.log(dates);
    console.log(dailySales);

    const ctx = document.getElementById('myChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Daily Sales',
                data: dailySales,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
</script>

<script>
    const salesCount = JSON.parse('<%- JSON.stringify(salesCount) %>');

    const date = salesCount.map(item => item._id);
    const orderCounts = salesCount.map(item => item.orderCount);

    const ctxs = document.getElementById('myChart2').getContext('2d');
    new Chart(ctxs, {
        type: 'bar',
        data: {
            labels: date,
            datasets: [{
                label: 'Orders per Date',
                data: orderCounts,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                },
                x: {
                    // Set the x-axis options as needed (e.g., for date labels)
                }
            }
        }
    });

</script>



<%-include('../layouts2/footer.ejs')%>




