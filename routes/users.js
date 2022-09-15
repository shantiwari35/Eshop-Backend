const { User } = require('../models/user');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.get(`/`, async (req, res) => {
    const userList = await User.find().select('-passwordHash');

    if (!userList) {
        res.status(500).json({ success: false })
    }
    res.send(userList);
})
router.get(`/:id`, async (req, res) => {
    const user = await User.findById(req.params.id).select('-passwordHash');

    if (!user) {
        res.status(500).json({ message: "The user with given ID was not found", success: false })
    }
    res.status(200).send(user);
});
router.post('/', async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })

    user = await user.save();
    if (!user) {
        return res.status(404).send('the user cannot be saved!');
    }

    res.send(user)
});

router.put('/:id', async (req, res) => {
    const userExist = await User.findById(req.params.id);
    console.log(userExist)
    let newPassword;
    if (req.body.password) {
        newPassword = bcrypt.hashSync(req.body.password);
    } else {
        newPassword = userExist.passwordHash;
    }
    const user = await User.findByIdAndUpdate(req.params.id,
        {
            name: req.body.name,
            email: req.body.email,
            passwordHash: newPassword,
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            street: req.body.street,
            apartment: req.body.apartment,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country,
        }
        , { new: true });
    if (!user)
        return res.status(400).send('the category cannot be updated!')

    res.send(user);

});

router.post('/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    const secret = process.env.secret;
    if (!user) {
        return res.status(400).send('The user not found');
    }

    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin
            },
            secret,
            {
                expiresIn: '1d'
            }
        )
        res.status(200).send({ user: user.email, token: token });
    } else {
        res.status(400).send('password is wrong');
    }

    return res.status(200).send(user);
});

router.get('/get/count', async (req, res) => {
    const userCount = await User.countDocuments();
    // console.log(userCount)
    if (!userCount) {
        res.status(500).json({ success: false })
    }
    res.send({
        userCount: userCount
    });
});

router.delete('/:id', (req, res) => {
    User.findByIdAndRemove(req.params.id).then(user => {
        if (user) {
            return res.status(200).json({
                success: true,
                message: "user deleted successfully"
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "user not found"
            });
        }

    }).catch(err => {
        return res.status(400).json({
            success: false,
            error: err
        })
    })
});
module.exports = router;