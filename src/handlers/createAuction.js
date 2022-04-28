const uuid = require('uuid');
const AWS = require('aws-sdk');
const validator = require('@middy/validator');
const createError = require('http-errors');
const commonMiddleware = require('../lib/commonMiddleware');
const createAuctionSchema = require('../lib/schemas/createAuctionSchema');

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function createAuction(event, context) {
  const { title } = event.body;
  const now = new Date();
  const endDate = new Date();
  endDate.setHours(now.getHours() + 1);

  const auction = {
    id: uuid.v4(),
    title,
    status: 'OPEN',
    createdAt: now.toISOString(),
    endingAt: endDate.toISOString(),
    highestBid: {
      amount: 0,
    },
  };
  try {
    await dynamodb
      .put({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Item: auction,
      })
      .promise();
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 201,
    body: JSON.stringify(auction),
  };
}

module.exports = {
  handler: commonMiddleware(createAuction).use(
    validator({
      inputSchema: createAuctionSchema,
      ajvOptions: { strict: false },
    })
  ),
};
