const express = require('express')
const router = express.Router()
const { ensureAuth } = require('../middleware/auth')
const Notes = require('../models/Notes')

// Login screen
router.get('/add', ensureAuth, (req,res)=>{
    res.render('notes/add')
})

router.post('/', ensureAuth, async (req,res)=> {
    try{
        req.body.user = req.user.id
        await Notes.create(req.body)
        res.redirect('/dashboard')
    }
    catch (err){
        console.error(err);
        res.render('error/500')
    }
})

// Fetch and render notes
router.get('/', ensureAuth, async (req,res)=>{
    try{
        const notes = await Notes.find({ status: 'public'})
            .populate('user')
            .sort({ createdAt: 'desc'})
            .lean()
        res.render('notes/index', {
            notes,
        })

    }
    catch (err){
        console.error(err)
        res.render('error/500')
    }
})

// Edit notes page
router.get('/edit/:id', ensureAuth, async (req,res)=>{
    const notes = await Notes.findOne({
        _id: req.params.id
    }).lean()

    if(!notes) {
        return res.render('error/404')
    }

    if(notes.user != req.user.id){
        res.redirect('/notes')
    }
    else{
        res.render('notes/edit', {
            notes,
        })
    }
})
module.exports = router