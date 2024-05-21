import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"

const registerUser = asyncHandler(async(req,res) => {
    //  res.status(200).json({
    //     message: "ok"
    // })

    //get user details from frontend
    //validation - not empty
    //check if user already exist or not : using username & email
    //check for images & check for avatar
    //upload them on cloudinary, check it is uploaded or not
    // create user object - create entry in db
    // remove password and refresh token field
    // check for user creation


    const {fullName,email,username,password} = req.body
    console.log("email",email)

    // if(fullName===""){
    //     throw new ApiError(400, "fullName is required")
    // }

    //alternative for above if condition
    if(
        [fullName,email,username,password].some((field) =>field?.trim() === "")
    ) {
        throw new ApiError(400, "all fields are required")
    }

    const existedUser = User.findOne({
        $or: [{username},{email}]
    })
    if(existedUser) {
        throw new ApiError(409, "User with username or email already exist")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImagePath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImagePath)

    if(!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser) {
        throw new ApiError(500, "something went wrong while registering user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser, "User registered Successfully")
    )
})

export {
    registerUser,
} 