
const express = require('express');
const cors = require('cors');
const { default: mongoose } = require('mongoose');
const User = require('./models/user');
const Post = require('./models/post');
const bcrypt = require('bcryptjs');
const app = express();
const jwt = require('jsonwebtoken');
const salt = bcrypt.genSaltSync(10);
const cookieParser = require('cookie-parser');
const secret = 'aiscb127944r3hbkcaxgifd13u2org';
const multer = require('multer');
const uploadMiddleware = multer({dest:'uploads/'});
const fs = require('fs');


app.use(cors({credentials:true, origin:'https://myblog-frontend-pearl.vercel.app'}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads',express.static(__dirname+'/uploads'));

mongoose.connect('mongodb+srv://blog:blog2024@cluster0.t15vo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

app.get('/hello', (req, res) => {
  res.json({ message: 'Hello' });
});


app.post('/register',  async (req,res)=>{
    const {username, password} = req.body;
    if (password.length!=0){
        try{
            const userDoc =  await User.create({username,password:bcrypt.hashSync(password,salt),});
            res.json(userDoc);
        } catch(e){
            res.status(400).json(e);
        }
    } else{
        res.status(400).json("Password is empty!")
    }
    
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const userDoc = await User.findOne({ username });
    
    if (!userDoc) {
        return res.status(400).json("Invalid username or password!");
    }
    const passOk = bcrypt.compareSync(password, userDoc.password);
    
    if (passOk) {
        console.log('User authenticated');
        jwt.sign({ username, id: userDoc._id }, secret, {}, (error, token) => {
            if (error) throw error;
            res.cookie('token', token).json({
                id: userDoc._id,
                username,
            });
        });
    } else {
        res.status(400).json("Invalid username or password!");
    }
});


app.get('/profile', (req,res)=>{
    const {token} = req.cookies;
    jwt.verify(token,secret, {}, (err,info)=>{
        if(err) throw err;
        res.json(info)
    })
})

app.post('/logout', (req,res)=>{
    res.cookie('token', '').json('ok');
})


app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
    let newPath = null;
    if (req.file) {
      const { originalname, path } = req.file;
      const parts = originalname.split('.');
      const ext = parts[parts.length - 1];
      newPath = path + '.' + ext;
      fs.renameSync(path, newPath);
    }
  
    const { token } = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) throw err;
  
      const { title, summary, content } = req.body;
  
      if (!title || !summary || !content) {
        return res.status(400).json({ error: 'Title, summary, and content are required' });
      }
  
      const postDoc = await Post.create({
        title,
        summary,
        content,
        cover: newPath,
        author: info.id,
      });
  
      res.json(postDoc);
    });
  });
  

app.put('/post',uploadMiddleware.single('file'), async (req,res) => {
    let newPath = null;
    if (req.file) {
      const {originalname,path} = req.file;
      const parts = originalname.split('.');
      const ext = parts[parts.length - 1];
      newPath = path+'.'+ext;
      fs.renameSync(path, newPath);
    }
  
    const {token} = req.cookies;
    jwt.verify(token, secret, {}, async (err,info) => {
      if (err) throw err;
      const {id,title,summary,content} = req.body;
      const postDoc = await Post.findById(id);
      const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
      if (!isAuthor) {
        return res.status(400).json('you are not the author');
      }
      await postDoc.updateOne({
        title,
        summary,
        content,
        cover: newPath ? newPath : postDoc.cover,
      });
  
      res.json(postDoc);
    });
  
  });

app.get('/post', async (req,res)=>{
    res.json(await Post.find().populate('author', ['username']).sort({createdAt:-1}).limit(20));
})

app.get('/post/:id', async(req,res)=>{
    const {id} = req.params;
    const postDoc = await Post.findById(id).populate('author', ['username']);
    res.json(postDoc);
})

app.delete('/delete/:id', async(req,res)=>{
    const {id} = req.params;
    try {
        await Post.findByIdAndDelete(id);
        res.json({ success: true, message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting post', error });
    }
})
//mongodb+srv://blog:blog2024@cluster0.t15vo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
app.listen(4000);
