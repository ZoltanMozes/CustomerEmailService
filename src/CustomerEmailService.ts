import {render} from 'ejs';

/**
 * Customer email-notification service.
 *
 * Generates and sends e-mail based on input JSON event,
 * using email address and template of the customer
 * supplied by retriever functions.
 *
 * @param emailTemplateRetriever retrieves email template of customer from an external repository
 * @param emailAddressRetriever  retrieves email address of customer from an external repository
 * @param emailSender sends email via external emailing infrastructure/library
 * @returns ready to use email generator and sending functionality
 */
function CustomerEmailService(
  emailTemplateRetriever: (
    customerId: number,
    eventname: string
  ) => Promise<string>,
  emailAddressRetriever: (customerId: number) => Promise<string>,
  emailSender: (email: CustomerEmail) => Promise<boolean>
) {
  return {
    generate: emailGenerator(emailTemplateRetriever, emailAddressRetriever),
    send: emailSender,
  };
}

export {CustomerEmailService};

//////////////////////////////////////////////////////////////////////////////////////

/**
 * Preconfigures resources used during email generation
 * - for retrieving of email-templates from an external repository
 * - for retrieving of email-addresses from an external repostiory
 *
 * of a given customer.
 *
 * @param emailTemplateRetriever See: {@link CustomerEmailService}
 * @param emailAddressRetriever See: {@link CustomerEmailService}
 * @returns preconfigured email-rendering functionality
 */
const emailGenerator =
  (
    emailTemplateRetriever: (
      customerId: number,
      eventname: string
    ) => Promise<string>,
    emailAddressRetriever: (customerId: number) => Promise<string>
  ) =>
  async (event: CustomerEvent, customerId: number): Promise<CustomerEmail> => {
    const [renderedEmailBody, emailAddress] = await Promise.all([
      emailTemplateRetriever(customerId, event.name).then(template =>
        renderEmailBody(template, event)
      ),
      emailAddressRetriever(customerId),
    ]);
    return {body: renderedEmailBody, to: emailAddress};
  };

function renderEmailBody(template: string, event: any) {
  console.log(
    'Rendering email using template: ' + template + ' and event: ' + event
  ); //  shall be replaced by a specific logging package - trace level
  const rendered = render(template, event);
  console.log(rendered); //  shall be replaced by a specific logging package - debug level
  return rendered;
}
