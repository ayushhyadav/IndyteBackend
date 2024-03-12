const otpValidate  = async(otpTime) => {
    const currentTime = new Date().getTime();
    const otpTimeInMs = new Date(otpTime).getTime();
    const difference = currentTime - otpTimeInMs;
    if(difference > 600000){
        return false;
    }
    return true; 
}

export default otpValidate;