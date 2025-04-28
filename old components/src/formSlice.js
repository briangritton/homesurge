import { createSlice, createListenerMiddleware } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

// call setFormData more often to ensure that the data is being written to the DB if async occurs

const initialState = {
  //database id
  id: "",
  count: 0,
  name: "",
  manualName: "",
  apiOwnerName: "",
  autoCompleteName: "",
  email: "",
  phone: "",
  street: "",
  manualStreet: "",
  editedStreet: "",
  city: "",
  zip: "",
  apiEquity: "",
  apiPercentage: "",
  apiHomeValue: "",
  apiMaxHomeValue: "",
  phones: [],
  dynamicHeadline: "",
  dynamicSubHeadline: "",
  thankYouHeadline: "",
  thankYouSubHeadline: "",
  submitting: false,
  submitted: false,
  submissionError: null,
  recordSubmitting: false,
  recordSubmitted: false,
  propertyRecord: null,
  addressSelectionType: "Manual", //Google, Autocomplete, or Manual
  url: "",
  trafficSource: "",
  campaignId: "",
  campaignName: "",
  adgroupdId: "",
  adgroupName: "",
  keyword: "",
  gclid: "",
  device: "",

  verifyPhone: false, //tells the crm that is should send a verification code.
  verificationCode: "",
  verificationCodeError: null,
  phoneVerified: false,

  isPropertyOwner: "true",
  needRepairs: "false",
  propertyType: "",
  workingWithAgent: "false",

  homeType: "",
  remainingMortgage: "",

  bedrooms: "",
  bathrooms: "",
  floors: "",
  finishedSquareFootage: "",
  basementSquareFootage: "",
  howSoonSell: "",
  reasonForSelling: "",
  garage: "",
  garageCars: "",
  hasHoa: "",
  hasSolar: "",
  planningToBuy: "",
  septicOrSewer: "",
  knownIssues: "",

  qualifyingQuestionStep: 1,

  wantToSetAppointment: "",
  selectedAppointmentDate: "",
  selectedAppointmentTime: "",
};

const formSlice = createSlice({
  name: "form",
  initialState,
  reducers: {
    formDataChanged: (state, action) => {
      console.log("Form data changed: ", action.payload);
      return { ...state, ...action.payload };
    },
    formSubmitted: (state, action) => {
      console.log("Form submitted: ", action.payload);
      return { ...state, ...action.payload, submitting: true };
    },
    leadDataChanged: (state, action) => {
      console.log("Lead data changed: ", action.payload);
      return { ...state, ...action.payload };
    },
    recordChanged: (state, action) => {
      console.log("Record changed: ", action.payload);
      return { ...state, recordSubmitting: false, ...action.payload };
    },
    formSubmissionSuccess: (state, action) => {
      return {
        ...state,
        ...action.payload,
        submitting: false,
        submitted: true,
      };
    },
    formSubmissionError: (state, action) => {
      return {
        ...state,
        ...action.payload,
        submitting: false,
        submitted: false,
      };
    },
    recordSubmissionSuccess: (state, action) => {
      return {
        ...state,
        ...action.payload,
        recordSubmitting: false,
        recordSubmitted: true,
      };
    },
    recordSubmissionError: (state, action) => {
      return {
        ...state,
        ...action.payload,
        recordSubmitting: false,
        recordSubmitted: false,
      };
    },
    verifyCode: (state, action) => {
      return { ...state, ...action.payload };
    },
    verifyCodeSuccess: (state, action) => {
      return { ...state, ...action.payload, verificationCodeError: null };
    },
    verifyCodeError: (state, action) => {
      return { ...state, ...action.payload };
    },
  },
});

export const {
  formDataChanged,
  formSubmitted,
  leadDataChanged,
  recordChanged,
  formSubmissionSuccess,
  formSubmissionError,
  recordSubmissionSuccess,
  recordSubmissionError,
  verifyCode,
  verifyCodeSuccess,
  verifyCodeError,
} = formSlice.actions;

// Create the middleware instance and methods. This is registered in the index.js configureStore() call.
export const formListeners = createListenerMiddleware();

// Add one or more listener entries that look for specific actions.
// They may contain any sync or async logic, similar to thunks.
formListeners.startListening({
  //This is called anytime the form data changes.
  actionCreator: formSubmitted,
  effect: async (action, listenerApi) => {
    // Run whatever additional side-effect-y logic you want here
    const formData = listenerApi.getState().form;
    console.log(
      "Form form submitted: action: ",
      action.payload,
      ", state: ",
      formData
    );
    //form validation checks
    const { phone, street, name } = action.payload;
    //We only want to update the partial when these values have changed.
    if (!phone && !street) {
      //If we've submitted the form before and the name has changed, we want to update the lead.
      if (!name || !formData.submitted) return;
    }
    await updateLead(formData, listenerApi.dispatch);
  },
});

formListeners.startListening({
  actionCreator: leadDataChanged,
  effect: async (action, listenerApi) => {
    const formData = listenerApi.getState().form;
    const { phone } = formData;
    if (!phone) return;
    await updateLead(formData, listenerApi.dispatch);
  },
});

formListeners.startListening({
  actionCreator: verifyCode,
  effect: async (action, listenerApi) => {
    const formData = listenerApi.getState().form;
    const { verificationCode, id, userId } = formData;
    if (!verificationCode) return;
    await verifyPhoneCode(verificationCode, id, userId, listenerApi.dispatch);
  },
});

formListeners.startListening({
  actionCreator: formSubmissionSuccess,
  effect: async (action, listenerApi) => {
    console.log("Form submission success: ", action.payload);
    const formData = listenerApi.getState().form;
    const { propertyRecord, recordSubmitting, recordSubmitted } = formData;
    if (!propertyRecord || recordSubmitting || recordSubmitted) return;
    listenerApi.dispatch(recordChanged({ recordSubmitting: true }));
    await sendRecord(
      { ...propertyRecord, Cookie: formData.userId, LeadId: formData.id },
      listenerApi.dispatch
    );
  },
});

const updateLead = async (formData, dispatch) => {
  try {
    console.log("updating lead...");
    const { data } = await axios.post(
      "https://leads.goinsightmarketing.com/api/re/RegisterReUser",
      {
        name: formData.name,
        phoneNumber: formData.phone,
        trafficSource: formData.trafficSource,
        email: formData.email,
        cookie: formData.userId,
        city: formData.city,
        zip: formData.zip,
        streetAddress: formData.street,
        leadType: "ReSeller",
        state: "GA",
        url: formData.url,
        data: {
          userInputtedStreet: formData.manualStreet,
          dynamicHeadline: formData.dynamicHeadline,
          dynamicSubHeadline: formData.dynamicSubHeadline,
          thankYouHeadline: formData.thankYouHeadline,
          thankYouSubHeadline: formData.thankYouSubHeadline,
          addressSelectionType: formData.addressSelectionType,
          apiOwnerName: formData.apiOwnerName,
          apiMaxHomeValue: formData.apiMaxHomeValue,
          autoCompleteName: formData.autoCompleteName,
          manualName: formData.manualName,
          campaignName: formData.campaignName,
          adgroupName: formData.adgroupName,
          keyword: formData.keyword,
          campaignId: formData.campaignId,
          adgroupId: formData.adgroupId,
          device: formData.device,
          gclid: formData.gclid,
          trafficSource: formData.trafficSource,
          verifyPhone: formData.verifyPhone,
          isPropertyOwner: formData.isPropertyOwner,
          needRepairs: formData.needRepairs,
          propertyType: formData.propertyType,
          workingWithAgent: formData.workingWithAgent,
          homeType: formData.homeType,
          remainingMortgage: formData.remainingMortgage,
          bedrooms: formData.bedrooms,
          bathrooms: formData.bathrooms,
          floors: formData.floors,
          finishedSquareFootage: formData.finishedSquareFootage,
          basementSquareFootage: formData.basementSquareFootage,
          howSoonSell: formData.howSoonSell,
          reasonForSelling: formData.reasonForSelling,
          garage: formData.garage,
          garageCars: formData.garageCars,
          hasHoa: formData.hasHoa,
          hasSolar: formData.hasSolar,
          planningToBuy: formData.planningToBuy,
          septicOrSewer: formData.septicOrSewer,
          knownIssues: formData.knownIssues,
          qualifyingQuestionStep: formData.qualifyingQuestionStep,
          wantToSetAppointment: formData.wantToSetAppointment,
          selectedAppointmentDate: formData.selectedAppointmentDate,
          selectedAppointmentTime: formData.selectedAppointmentTime,
        },
      }
    );
    console.log("Lead updated: ", data);
    dispatch(formSubmissionSuccess({ id: data.id }));
  } catch (error) {
    dispatch(formSubmissionError({ submissionError: error }));
    console.error("Failed to send form data to api server ", error);
  }
};

const verifyPhoneCode = async (code, userId, cookie, dispatch) => {
  try {
    console.log("Verifying code...");
    const { data } = await axios.post(
      "https://leads.goinsightmarketing.com/api/re/verifycode",
      {
        code: code,
        userId: userId,
        cookie: cookie,
      }
    );
    console.log("Code verified: ", data);
    dispatch(verifyCodeSuccess({ phoneVerified: true }));
  } catch (error) {
    dispatch(verifyCodeError({ verificationCodeError: error?.response?.data }));
  }
};

const sendRecord = async (propertyRecord, dispatch) => {
  try {
    console.log("Sending record...");
    const { record } = await axios.post(
      "https://leads.goinsightmarketing.com/api/re/saverecord",
      propertyRecord
    );
    console.log("Record sent: ", record);
    dispatch(recordSubmissionSuccess({ recordSubmitted: true }));
  } catch (error) {
    dispatch(recordSubmissionError({ submissionError: error }));
  }
};

export default formSlice.reducer;
