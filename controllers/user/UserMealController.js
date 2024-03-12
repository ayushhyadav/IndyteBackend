import prisma from "../../db/db.config.js";


class UserMealController{
    static async CreateMealLog (req, res) {
        const {userId, mealId, mealTime, date, imgUrl, comment, review}  = req.body;
    try{        
        if(!userId || !mealId){
            return res.status(400).json({
                status: 400,
                message: "Please provide meal id and user id.",
            });
        }
        
        const userWithMeals = await prisma.userWithMeals.findFirst({
            where:{
                userId,
                mealId,
                date, 
                mealTime  
            }
        })

        if(!userWithMeals) {
            return res.status(400).json({ 
                status: 400,
                message: "Meal dont exist for given user at given time",
            });
        }

        const alreadyMarked = await prisma.userWithMeals.findFirst({
            where: {
               id: userWithMeals.id,
               finished: true

            }
        });


        if (alreadyMarked) {
            return res.status(400).json({
            status: 400,
            message: "Meal already marked for this day.",
            });
        }


        const finishMeal = await prisma.userWithMeals.update({
            where:{
                id: userWithMeals.id
            },
            data:{
                finished: true,
                imgUrl,
                comment,
                review

            }

        });


        // api body

//         {
//     "mealId": "65cba797f314d9197ecf00f1",
//     "userId": "65c7352484971c8d6bf6c3f6",
//     "dayOfWeek" : "SUNDAY",
//     "mealTime" : "BREAKFAST",
//     "day" : "2020-12-23T12:40:00.000Z",
//     "imgUrl" : "xyz.com",
//     "comment": "bad meal",
//     "review" : 5

// }

        return res.status(200).json({
            status: 200,
            message: "Meal log created successfully.",
            data: finishMeal,
        });} 

        catch(error) {
            console.log("The error is", error);
            return res.status(500).json({
                status: 500,
                message: "Something went wrong.Please try again.",
            });
        }
       

        
    }

    //this needs logic improvement
    static async getUserMealForDay(req, res) {
        const {userId, date} = req.query;
        try {
            if(!userId){
                return res.status(400).json({
                    status: 400,
                    message: "Please provide user id , meal id , day of week and day.",
                });
            }
            
            const mealLog = await prisma.userWithMeals.findMany({
                where: {
                    userId,
                    date //isme date comparison shi karna hai 
                }
            });
            return res.status(200).json({
                status: 200,
                message: "Meal log fetched successfully.",
                data: mealLog,
            });
        } catch (error) {
            console.log("The error is", error);
            return res.status(500).json({
                status: 500,
                message: "Something went wrong.Please try again.",
            });
        }
}

        static async getUserMealLog (req, res) {
            try {
                const { userId } = req.query;
                if(!userId){
                    return res.status(400).json({
                        status: 400,
                        message: "Please provide user id.",
                    });
                }
                const mealLog = await prisma.userWithMeals.findMany({
                    where: {
                        userId
                    },
                    include : {
                        meal: {
                        select: {
                            meal: true
                        }
                    }
                }});
                return res.status(200).json({
                    status: 200,
                    message: "Meal log fetched successfully.",
                    data: mealLog,
                });
            } catch (error) {
                console.log("The error is", error);
                return res.status(500).json({
                    status: 500,
                    message: "Something went wrong.Please try again.",
                });
            }
        }

}

export default UserMealController;




// {
//     "mealId": "65cba797f314d9197ecf00f1",
//     "userId": "65c7352484971c8d6bf6c3f6",
//     "dayOfWeek" : "SUNDAY",
//     "mealTime" : "BREAKFAST",
//     "day" : "2020-12-23T12:40:00.000Z",
//     "imgUrl" : "xyz.com",
//     "comment": "bad meal",
//     "review" : 5

// }
