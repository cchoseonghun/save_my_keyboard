'use strict';

const OrdersRepository = require('../repositories/orders.repository');
const { Order } = require('../sequelize/models');
// const user = require('../sequelize/models/user');

class OrdersService {
    ordersRepository = new OrdersRepository(Order);

    findOrderById = async (ownerId) => {
        const allordersById = await this.ordersRepository.findOrderById(ownerId);
        
        allordersById.sort((a, b) => {
            return b.createdAt - a.createdAt;
        });
        
        return allordersById.map((orders) => {
            return {
                ownerId: orders.ownerId,
                kinds: orders.kinds,
                details: orders.details,
                pickup: orders.pickup, 
                imageUrl: orders.imageUrl,
                createdAt: orders.createdAt,
                updatedAt: orders.updatedAt
            };
        });     
    }; 

    createOrder = async (ownerId, kinds, details, pickup, imageUrl) => {
        const response = await this.ordersRepository.createOrder(ownerId, kinds, details, pickup, imageUrl);
        
        return {code:201, message: "주문에 성공하였습니다."}
    };
    
     
}
module.exports = OrdersService;

