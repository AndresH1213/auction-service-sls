const createError = require('http-errors');
const getEndedAuctions = require('../lib/getEndedAuctions');
const closeAuction = require('../lib/closeAuction');

async function processAuctions(event, context) {
  try {
    const auctionsToClose = await getEndedAuctions();
    const closePromises = auctionsToClose.map((auction) =>
      closeAuction(auction)
    );
    await Promise.all(closePromises);
    // as this is not invoken by api gatewate this reponse is ok
    return { closed: closePromises.length };
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
}

module.exports = {
  handler: processAuctions,
};
