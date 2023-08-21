const mongoose = require("mongoose");
const { Schema } = mongoose;

function validateNumberOrString(value) {
  if (
    value === null ||
    typeof value === "number" ||
    typeof value === "string"
  ) {
    return true;
  } else {
    return false;
  }
}

const customerSchema = new Schema({
  firstname: { type: String },
  lastname: { type: String },
  title: { type: String },
  seniority: { type: String },
  company: { type: String },
  email: { type: String },
  departments: { type: String },
  industry: { type: String },
  keywords: { type: String },
  employeesCount: {
    type: mongoose.Schema.Types.Mixed,
    validate: {
      validator: validateNumberOrString,
      message: "#Employees must be a number, string.",
    },
    alias: "#employees",
  },
  technologies: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String },
  companycity: { type: String },
  companystate: { type: String },
  companycountry: { type: String },
  emailstatus: { type: String },
  phonestatus: { type: String },
  siccodes: {
    type: mongoose.Schema.Types.Mixed,
    validate: {
      validator: validateNumberOrString,
      message: "SIC code must be a number, string.",
    },
  },
  annualrevenue: {
    type: mongoose.Schema.Types.Mixed,
    validate: {
      validator: validateNumberOrString,
      message: "Annual revenue must be a number, string.",
    },
  },

  totalfunding: {
    type: mongoose.Schema.Types.Mixed,
    validate: {
      validator: validateNumberOrString,
      message: "Total funding must be a number, string.",
    },
  },
  foundedyear: {
    type: mongoose.Schema.Types.Mixed,
    validate: {
      validator: validateNumberOrString,
      message: "founded year must be a number, string.",
    },
  },

  retaillocations: {
    type: mongoose.Schema.Types.Mixed,
    validate: {
      validator: validateNumberOrString,
      message: "Annual revenue must be a number, string.",
    },
    alias: "numberofretaillocations",
  },
  companyNameForEmails: { type: String, alias: "companynameforemails" },
  emailconfidence: { type: String },
  contactowner: { type: String },
  firstphone: { type: String },
  workDirectPhone: { type: String, alias: "workdirectphone" },
  homephone: { type: String },
  mobilephone: { type: String },
  corporatephone: { type: String },
  otherphone: { type: String },
  stage: { type: String },
  lists: { type: String },
  lastContacted: { type: String },
  accountOwner: { type: String },
  personLinkedinUrl: { type: String },
  website: { type: String },
  companyLinkedinUrl: { type: String, alias: "companylinkedinurl" },
  facebookurl: { type: String },
  twitterurl: { type: String },
  companyaddress: { type: String },
  seodescription: { type: String },
  latestfunding: { type: String },
  latestFundingAmount: {
    type: mongoose.Schema.Types.Mixed,
    validate: {
      validator: validateNumberOrString,
      message: "Latest Funding Amount must be a number, string.",
    },
    alias: "latestfundingamount",
  },
  lastRaisedAt: { type: String, alias: "lastraisedat" },
  // lastRaisedAt: { type: Date, alias: "lastraisedat" },
  emailsent: { type: String },
  emailopen: { type: String },
  emailbounced: { type: String },
  replied: { type: String },
  demoed: { type: String },
});

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
