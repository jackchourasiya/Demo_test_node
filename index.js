const express = require('express');
const app     = express();
const db      = require('./connection');
const route   = require('./route')

app.use(express.json())
db.connect((err)=>{
    if(err){
        console.log(err)
    }else{
        console.log('db connected')
    }
})

app.use('/api',route)

app.listen(3000,() => console.log('connected'));