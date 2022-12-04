const express = require("express");
const router = express.Router();
const { doneAuthenticating } = require("../middleware/auth");
const User = require("../models/Users.js");
const { check, validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.get("/", doneAuthenticating, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).json('Server Error')
  }
});

//@route    POST api/auth
//@desc     Authenticate User & Get Token
//@access   Public

router.post(
  "/",
  [
    check("email", "Please provide a valid email").isEmail(),
    check(
      "password",
      "Please provide a valid password with atleast 6 characters"
    ).exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {email, password } = req.body;

    try {
      //Check if the user exists
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ message: "Invalid Credentials !!" }] });
      }

      const isMatch = await bcrypt.compare(password, user.password); 

      if (!isMatch) {
        return res
          .status(400)
          .json({errors: [{message: "Invalid Credentials"}]})
      }


      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        process.env.TOKEN_SECRET,
        { expiresIn: 3600 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (error) {
      console.log(error);
      res.status(500).send("Server Error");
    }
  }
);


module.exports = router;
