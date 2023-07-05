const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const authCenter = mongoose.model(
  "auth center",
  new Schema({
    businessName: {
      type: String,
      min: 3,
      max: 100,
      required: [true, "You must enter a Business Name"],
    },
    email: {
      type: String,
      required: [true, "You must enter an Email"],
    },
    businessPhoneNumber: {
      type: String,
      length: 11,
      match: /^[0-9]+$/,
      required: [true, "You must enter a Phone Number"],
    },
    rifNumber: {
      type: String,
      min: 3,
      max: 15,
      required: [true, "Please enter a RIF number"],
    },
    address: {
      type: String,
      min: 3,
      max: 300,
      required: [true, "Please enter a physical address"],
    },
    representative: {
      type: Object,
      required: [true, "Please enter a Representative of the business"],
      fullName: {
        type: String,
        min: 3,
        max: 100,
        required: [true, "You must enter a representative full name"],
      },
      identification: {
        type: String,
        min: 3,
        max: 10,
        required: [true, "Please enter an identification number"],
      },
      phoneNumber: {
        type: String,
        length: 11,
        match: /^[0-9]+$/,
        required: [true, "You must enter a Phone Number"],
      },
    },
    picture: {
      type: String,
    },
    backgroundCheck: {
      type: Boolean,
      required: [true, "Please enter if checkbackground was confirmed"],
    },
    city_name: {
      type: String,
      required: [true, "Please enter City name where checker will work"],
    },
    cityToCheck: {
      type: String,
      required: [true, "Please enter _id of City where checker will work"],
    },
    category: {
      type: Array,
      required: [true, "Please enter category information checker will check"],
      category_name: {
        type: String,
        required: [true, "Name of Checkers category is required"],
      },
      categoryToCheck: {
        type: String,
        required: [true, "Please enter checker`s category ID"],
      },
    },
    service_time: {
      type: Array,
      required: [true, "Please enter Service time information"],
      service_time_caption: {
        type: String,
        required: [true, "Please enter Service time caption"],
      },
      service_time_id: {
        type: String,
        required: [true, "Please enter Service time id"],
      },
    },
    rating: {
      type: Number,
      max: 5,
      required: [true, "Please enter checker rating"],
    },
    ratings: {
      type: Object,
      required: [true, "Controller should add these ratings automatically"],
      rating_r: {
        type: Number,
        max: 0,
        required: [true, "Please enter checker rating for responsability"],
      },
      rating_p: {
        type: Number,
        max: 0,
        required: [true, "Please enter checker rating for puntuality"],
      },
      rating_k: {
        type: Number,
        max: 0,
        required: [true, "Please enter checker rating for kindness"],
      },
      rating_kw: {
        type: Number,
        max: 0,
        required: [true, "Please enter checker rating for Knowledge"],
      },
      rating_t: {
        type: Number,
        max: 0,
        required: [true, "Please enter checker rating for trust"],
      },
      rating_c: {
        type: Number,
        max: 0,
        required: [true, "Please enter checker rating for communicative"],
      },
    },
    number_of_checks: {
      type: Number,
      max: 5,
      required: [true, "Please enter checker number of checks"],
    },
    pin: {
      type: String,
      min: 4,
      max: 4,
      required: [true, "Please enter a PIN number"],
    },
    role: {
      type: String,
      required: [true, "Please enter a role"],
    },
    earnings: {
      type: Number,
      required: [true, "Please enter an earning"],
    },
  })
);

module.exports = authCenter;
