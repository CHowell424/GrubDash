const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function list(req,res){
    res.json({data:dishes})
}

function dishHas(propery){
    return function(req,res,next){
        const { data ={}}=req.body;
        if(data[propery]){
            return next()
        }
        next({status:400, message:`Dish must include ${propery}`})
    }
}

function priceIsValid(req,res,next){
    const{data:{price ={}}}= req.body;
    if(price<=0 || !Number.isInteger(price)){
        return next({
            status:400,
            message:"Dish must have a price that is an integer greater than 0"
        })
    }
    next();
}

function create(req,res){
    const {data:{name,description,price,image_url}} = req.body;
    const newDish ={
        name,
        description,
        price,
        image_url,
        id: nextId()
    } 
    dishes.push(newDish);
    res.status(201).json({data:newDish})
}

function hasValidId(req,res,next){
    const id = req.params.dishId;
    const foundDish = dishes.find(dish=>dish.id == id);
    if(foundDish || !id){
        return next();
    }
    next({
        status: 404,
        message:`Dish does not exist: ${id}`
    })
}

function read(req,res){
    const id = req.params.dishId;
    const foundDish = dishes.find(dish=> dish.id ==id);
    res.status(200).json({data: foundDish});
}

function update(req,res, next){
    const dishId = req.params.dishId;
    const foundDish = dishes.find(dish=> dish.id ==dishId);
    const {data:{name, description, price, image_url, id}}=req.body;

    if(dishId !== id && id){
        return next({status:400, message:`data id (${id}) and id (${dishId}) do not match`})
    }

    foundDish.name = name;
    foundDish.description = description;
    foundDish.image_url = image_url;
    foundDish.price = price;
    
    res.json({data: foundDish});
}

module.exports = {
    list,
    create:[
        dishHas('name'),
        dishHas('description'),
        dishHas('price'),
        dishHas('image_url'),
        priceIsValid,
        create
    ],
    read:[hasValidId,read],
    update:[
        hasValidId,
        dishHas('name'),
        dishHas('description'),
        dishHas('price'),
        dishHas('image_url'),
        priceIsValid,
        update
    ]
}