const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    content:{
        type: String,
        //required: true,
        trim: true
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    pinned: {
        type: Boolean,
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    retweetUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    retweetData: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    replyToPost: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }
},{timestamps: true},);
const Post = mongoose.model('Post', PostSchema);

module.exports = Post