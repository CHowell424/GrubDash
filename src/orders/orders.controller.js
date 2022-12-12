const { stat } = require("fs");
const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function list(req,res){
    res.json({data: orders});
}

function orderHas(propery){
    return function(req,res,next){
        const { data ={}}=req.body;
        if(data[propery]){
            return next()
        }
        next({status:400, message:`Dish must include ${propery}`})
    }
}


function isValidDishs(req,res,next){
    const {data:{dishes =[]}}=req.body;
    if(dishes.length ==0 || typeof(dishes) !== "object"){
        next({status:400,message:"invalid dishes"})
    }
    next()
}

function isValidQuantity(req,res,next){
    const {data:{dishes =[]}}=req.body;
    dishes.forEach(dish => {
        if(!dish.quantity || dish.quantity==0 || !Number.isInteger(dish.quantity)){
            return next({status:400,message:`dish ${dishes.findIndex(d=>d.id == dish.id)} quantity is ${dish.quantity} it should be greter than 0`})
        }
    });
    next();
}

function create(req,res,next){
    const {data:{deliverTo,mobileNumber,dishes}} = req.body;
    const newOrder ={
        deliverTo,
        mobileNumber,
        dishes,
        status:"pending",
        id: nextId()
    } 
    orders.push(newOrder);
    res.status(201).json({data:newOrder})
}

function hasValidId(req,res,next){
    const id = req.params.orderId;
    const foundOrder = orders.find(order=>order.id == id);
    if(foundOrder){
        return next();
    }
    next({
        status: 404,
        message:`Order does not exist: ${id}`
    })
}

function read(req,res){
    const id = req.params.orderId;
    const foundOrder = orders.find(order=>order.id == id);
    res.status(200).json({data: foundOrder});
}

function update(req,res, next){
    const orderId = req.params.orderId;
    const foundOrder = orders.find(order=> order.id == orderId);
    const {data:{deliverTo,mobileNumber,dishes,status,id}}=req.body;

    if(orderId !== id && id){
        return next({status:400, message:`data id (${id}) and id (${orderId}) do not match`})
    }
    if(status !=="pending"){
        return next({status:400, message:"status is deliverd and cannot be changed"})
    }
    foundOrder.deliverTo = deliverTo;
    foundOrder.mobileNumber = mobileNumber;
    foundOrder.dishes = dishes;
    foundOrder.status = status;
    
    res.json({data: foundOrder});
}

function statusIsNotPending(req,res,next){
    const orderId = req.params.orderId;
    const foundOrder = orders.find(order=> order.id == orderId);
    if(foundOrder.status ==="pending"){
        return next();
    }
    next({status: 400, message:`An order cannot be deleted unless it is pending`})
}

function destroy(req,res){
    const id = req.params.orderId;
    const index = orders.findIndex(order=>order.id ==id);

    orders.splice(index,1)
    res.sendStatus(204);
}

module.exports={
    list,
    create:[
        orderHas("deliverTo"),
        orderHas("mobileNumber"),
        orderHas("dishes"),
        isValidDishs,
        isValidQuantity,
        create
    ],
    read:[
        hasValidId,
        read
    ],
    update:[
        orderHas("deliverTo"),
        orderHas("mobileNumber"),
        orderHas("status"),
        orderHas("dishes"),
        isValidDishs,
        isValidQuantity,
        hasValidId,
        update
    ],
    delete:[hasValidId,statusIsNotPending, destroy]
}