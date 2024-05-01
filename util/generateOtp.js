const crypto= require('crypto')

const generateOTP=()=>{

    return (crypto.randomBytes(2).readUInt16BE()%10000).toString().padStart(4,'0')
}
module.exports ={
    generateOTP
}