import assert = require('assert');
import CustomerEmailService = require('../src/CustomerEmailService');

const mockEmailTemplateRetriever = async (
  customerId: number,
  eventname: string
) => {
  return (
    '<h1>CustomerID: ' +
    customerId +
    '</h1><h2>Event: ' +
    eventname +
    '</h2><body>Details: <%= details %></body>'
  );
};

const mockEmailAddressRetriever = async (customerId: number) => {

  if (customerId == 123) {
    return 'mockemail@diligent.com';
  } else {
    throw new Error('EmailAddressNotFoundException');
  }

};

const mockEmailSender = async (email: CustomerEmail) => {
  return true;
};

/**
 * Injecting external (mocked) dependencies
 */
const customerEmailService = CustomerEmailService.CustomerEmailService(
  mockEmailTemplateRetriever,
  mockEmailAddressRetriever,
  mockEmailSender
);



describe('CustomerEmailService test suite', () => {
  describe('Email generation', () => {
    it('Generating email based on retrieved template and email address', async () => {
      const email = await customerEmailService.generate(
        {
          name: 'Subscription termination event',
          details: 'Credit Card Expired!',
        },
        123
      );

      assert.deepStrictEqual(email, {
        body: '<h1>CustomerID: 123</h1><h2>Event: Subscription termination event</h2><body>Details: Credit Card Expired!</body>',
        to: 'mockemail@diligent.com',
      });
    });

    it('Negative test: Promise is rejected if customer email address were found', async () => {
      const email = customerEmailService.generate(
        {
          name: 'Subscription termination event',
          details: 'Credit Card Expired!',
        },
        999 // Promise shall be rejected because mockEmailAddressRetriever will throw an Error -> and so returned Promise will be implicitely rejected.
      );

      var isRejected = false;

      await email.catch(() => { isRejected = true; });

      assert.strictEqual(isRejected, true);

    });


  });
  describe('Email sending', () => {
    it('Email sent successfully', async () => {
      const sendingResult = await customerEmailService
        .generate(
          {
            name: 'Subscription termination event',
            details: 'Credit Card Expired!',
          },
          123
        )
        .then(customerEmailService.send);
      assert.strictEqual(sendingResult, true);
    });
  });
});
