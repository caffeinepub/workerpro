import Time "mo:core/Time";

module {
  type OtpRecord = {
    phone : Text;
    otp : Text;
    createdAt : Time.Time;
    used : Bool;
  };
};
