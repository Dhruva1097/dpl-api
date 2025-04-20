
const FCM = require('fcm-push');
const { Users, Notifications, Fixtures } = require('../models')
const {fetch_user, pagination} = require('../helpers')

const serverKey = 'AAAASaSlzBw:APA91bGfIgOO2jy3Hp4eTvjcZyGezunMiZf66miry50_WayTk_N3q_GaLzNF31SLAunArA_rFJuEh6VFrKRLBEwybDcCkMr2JDQQWfG_jJNcWggS4GY-gFKz8czV3J7u0u9w2xOhgvcV'

const fcm = new FCM(serverKey);

const notify = async (req, res) => {
    const fetch_user_fcm = await Users.findAll({
        attributes: ['user_name']
    })

    const user_fcm = fetch_user_fcm.map(e => e.user_name)

    let single_message = {
        to: 'cxlvlzc6S76PITR1SKfH-U:APA91bE6jhFwBN6uCVOEiLrxJe6NNN6w_9hMM976az7Fn2bEaNnEToOwaRUamoVroD3MRyg9azH36rE4opotFPmU2tChAGn8c25D5fNiZkqAr5IXAfegvcOpt26A3Mzx-WtYWxA4c7Np',
        collapse_key: 'com.dpl11',
        notification: {
            title: req.body.title,
            body: req.body.body
        }
    };

    let multi_message = {
        registration_ids: ['cxlvlzc6S76PITR1SKfH-U:APA91bE6jhFwBN6uCVOEiLrxJe6NNN6w_9hMM976az7Fn2bEaNnEToOwaRUamoVroD3MRyg9azH36rE4opotFPmU2tChAGn8c25D5fNiZkqAr5IXAfegvcOpt26A3Mzx-WtYWxA4c7Np','fh93oTfsSkW2TCfDd6YQ52:APA91bF2v-BVye35gMO0DWA-hJ2_AiFdaJrGoFweXBhDyL7XD-vNnYkOXyuEEthTxiCJw3eIEkep5TL4bKGJx2k48RTQzDPbA4IRWrsqlfqlOtx0mXGsqHPzF6mYcUA-L-3M3pScNB63'],
        collapse_key: 'com.dpl11',
        notification: {
            title: req.body.title,
            body: req.body.body
        }
    };

    // res.status(200).json({
    //     status: true,
    //     data: user_fcm
    // })

    fcm.send(multi_message)
        .then(function (response) {
            console.log("Successfully sent with response: ", response);
            res.status(200).json({
                message: 'notifications sent successfully',
                data: response
            })
        })
        .catch(function (err) {
            console.log("Something has gone wrong!");
            res.status(400).json({
                message: 400,
                data: err
            })
        })
}
 
const notification_list = async (req, res) => {
    try { 
        const token = await fetch_user(req.headers.authorization.split(" ")[1])        
        const page = req.query.page ? req.query.page : 1
        const limit = 10
        const paginate = pagination(page, limit)
        const totalPages = Math.ceil(await Notifications.count({ where: { status: 1, user_id:token?.id } }) / limit)
        const fetch_notification = await Notifications.findAll({
            where: {                
                user_id :token.id,
                status : 1
            },
            order: [['createdAt', 'DESC']],
            offset: paginate.offset,
            limit: paginate.limit,
            attributes: ['id', 'user_id', 'date', 'notification_type', 'title', 'notification'],
            include: [{               
                model: Fixtures 
            }]
        })    


        const modify_Data = fetch_notification.map(e => {
            return({
                id: e.id,
                user_id :e.user_id,
                date: e.date,
                notification_type: e.notification_type,
                title: e.title,
                notification: e.notification,
                match_data : (e.notification_type === 2 ||e.notification_type === 3) ? {} : e.fixture
            })
        })


        res.status(200).json({
            status: true,
            message: 'notification list found',
            data: {
                data: modify_Data,
                totalPages,
                currentPages: Number(page)
            }
        })
    } catch (error) {
        res.status(400).json({
            status: false,
            message: error.message,
            data: {}
        })
    }
}

const notification_delete = async (req, res) => {
    try {
        const token = await fetch_user(req.headers.authorization.split(" ")[1])
        const {notification_id, clear_all} = req.body

        const fetch_notification = await Notifications.findAll({
            where : {
                user_id : token.id,
                status : 1
            }
        })

        if (clear_all) {
            for (let i = 0; i < fetch_notification.length; i++) {
                await Notifications.update({
                    status: 0
                }, {
                    where: {
                        id : fetch_notification[i].id
                    }
                })
            }
        } else {
            await Notifications.update({
                status: 0
            }, {
                where: {
                    id : notification_id
                }
            })
        }

        res.status(200).json({
            status: true,
            message : "notification cleared successfully",
            data: {}
        })

    } catch (error) {
        res.status(400).json({
            status: false,
            message: error.message,
            data: {}
        })
    }
}

module.exports = {
    notify,
    notification_list,
    notification_delete
}
