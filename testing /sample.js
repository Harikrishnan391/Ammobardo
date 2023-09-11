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
}