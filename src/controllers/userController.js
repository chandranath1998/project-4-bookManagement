const userModel =  require('../models/userModel')
const jwt = require('jsonwebtoken')
const validator = require("validator")


module.exports.createAuthor = async function(req,res){
    try {
	let data = req.body
	    if(Object.keys(data).length == 0) return res.status(400).send({status:false,message:"request body can't be empty"})
	   
	    let {title,name, phone, email, password, address} = data
        
        title = title.trim()
        name = name.trim()
        phone = phone.trim()
        password = password.trim()
        email = email.trim()

	    if(!title)  return res.status(400).send({status:false,message:"Please provide title"})
	    if(!name)  return res.status(400).send({status:false,message:"Please provide name"})
	    if(!phone)  return res.status(400).send({status:false,message:"Please provide phone"})
	    if(!email)  return res.status(400).send({status:false,message:"Please provide email"})
	    if(!password)  return res.status(400).send({status:false,message:"Please provide password"})
	    if(!address)  return res.status(400).send({status:false,message:"Please provide address"})
	
	    let titleEnum = userModel.schema.obj.title.enum
	    if(!titleEnum.includes(title)) return res.status(400).send({status:false,message:"title must contain Mr,Miss or Mrs"})
	
        if(!validator.isEmail(email)) return res.status(400).send({status:false,message:"invalid Email format"})

	    let checkMail = await userModel.find({email:email})
	    if(checkMail.length != 0) return res.status(400).send({status:false,message:"email is not unique"})
	
	    let checkPhone = await userModel.find({phone:phone})
	    if(checkPhone.length != 0) return res.status(400).send({status:false,message:"phone number already exist"})
	
	    let passCheck = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,15}$/  //min 8, max 15, upper+lower+numeric
	    if(!password.match(passCheck)) return res.status(400).send({status:false,message:"invalid password format"})
	
	    let finalData = await userModel.create(data)
	    res.status(201).send({status:true,message:'success',data:finalData})
} catch (error) {
    console.log(error.message)
    res.status(500).send({status:false,message:"something is wrong with server"})
}
}


module.exports.loginUser = async function (req, res) {
    try {
        const data = req.body
        const { email, password } = req.body

        if(Object.keys(data)==0){
            return res.status(400).send({ status: false, message: "enter the email and password" })
        };
        if (!email) {
            return res.status(400).send({ status: false, message: "email is required" });
        };

        if (!password) {
            return res.status(400).send({ status: false, message: "password is required" });
        };

        const findCredentials = await userModel.findOne({ email:email,password:password });

        if (!findCredentials) {
            return res.status(401).send({ status: false, message: 'Invalid login credentials. Email id or password is incorrect.' });
        };

        const id = findCredentials._id

        const token =  jwt.sign({
            userId: id,
        },"project4Group8",{expiresIn:"30m"});

        res.header('x-api-key', token);

        return res.status(200).send({ status: true, message: 'success', data:{token:token} });

    } catch (err) {
       return res.status(500).send({status:false , message:err.message})
    };
}
