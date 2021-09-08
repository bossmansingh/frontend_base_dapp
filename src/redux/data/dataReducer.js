const initialState = {
  loading: false,
<<<<<<< HEAD
  accountBalance: "",
=======
  name: "",
>>>>>>> 894d5c47a54bf99eb188d3f948996214c95dda97
  error: false,
  errorMsg: "",
};

const dataReducer = (state = initialState, action) => {
  switch (action.type) {
    case "CHECK_DATA_REQUEST":
      return {
        ...initialState,
        loading: true,
      };
    case "CHECK_DATA_SUCCESS":
      return {
        ...initialState,
        loading: false,
<<<<<<< HEAD
        accountBalance: action.payload.accountBalance,
=======
        name: action.payload.name,
>>>>>>> 894d5c47a54bf99eb188d3f948996214c95dda97
      };
    case "CHECK_DATA_FAILED":
      return {
        ...initialState,
        loading: false,
        error: true,
        errorMsg: action.payload,
      };
    default:
      return state;
  }
};

export default dataReducer;
