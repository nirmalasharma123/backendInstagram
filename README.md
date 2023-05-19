# backendInstagram
Instagram Backend Clone
This project is a backend clone of Instagram, implementing various models and functionalities such as user signup and login, JWT token authentication and authorization, post creation, deletion, and update, profile management, commenting on posts, following and unfollowing users, liking posts, and more.

Models
The project includes the following models:

User Model
The user model represents a user in the system.


```javascript
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    userName: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    phoneNo: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        min: 8,
        max: 15
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
```
Profile Model
The profile model represents a user's profile information.

```javascript
const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
    profileOf: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    bio: {
        type: String,
        default: "your bio"
    },
    profilePic: {
        type: String,
        default: "https://classroom-training-bucket.s3.ap-south-1.amazonaws.com/bookCover/no-profile-picture-6-1024x1024.jpg"
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followersCount: {
        type: Number,
        default: 0
    },
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followingCount: {
        type: Number,
        default: 0
    },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    postCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model("Profile", profileSchema);
```
Post Model
The post model represents a post made by a user.

```javascript

const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    photo: {
        type: String,
        default: "no photo"
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    caption: {
        type: String,
        trim: true,
        max: 500
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    likesCount: {
        type: Number,
        default: 0
    },
    profileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile",
        required: true
    },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    commentsCount: {
        type: Number,
        default: 0
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);
```
Comment Model

```javascript
The comment model represents a comment made on a post.

const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true
    },
    text: {
        type: String,
        trim: true
    },
    replyCount: {
        type: Number,
        default: 0
    },
    reply: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reply" }],
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model("Comment", commentSchema);
```
Reply Model
The reply model represents a reply to a comment on a post.

```javascript
const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    commentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        required: true
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true
    },
    text: {
        type: String,
        max: 500
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });
```
module.exports = mongoose.model("Reply", replySchema);
Functionality
The backend clone of Instagram includes the following functionality:

User signup and login
JWT token authentication and authorization
Create, delete, and update posts
Update profile information
Create comments on posts
Follow and unfollow users
Like posts
View users who have liked a post
View comments on a post
This is a brief overview of the Instagram backend clone project. Additional code and configuration may be required for a fully functional implementation.

