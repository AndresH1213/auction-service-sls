const AWS = require('aws-sdk');
const commonMiddleware = require('../lib/commonMiddleware');
const validator = require('@middy/validator');
const createError = require('http-errors');
const getAuctionsSchema = require('../lib/schemas/getAuctionsSchema');

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getAuctions(event, context) {
  let auctions;
  const { status } = event.queryStringParameters;

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    IndexName: 'statusEndDate',
    KeyConditionExpression: '#status = :status',
    ExpressionAttributeValues: {
      ':status': status,
    },
    ExpressionAttributeNames: {
      '#status': 'status',
    },
  };

  try {
    const result = await dynamodb.query(params).promise();

    auctions = result.Items;
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auctions),
  };
}

module.exports = {
  handler: commonMiddleware(getAuctions).use(
    validator({
      inputSchema: getAuctionsSchema,
      ajvOptions: {
        strict: false,
        useDefaults: true,
      },
    })
  ),
};
