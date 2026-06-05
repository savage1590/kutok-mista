const { Resend } = require('resend');

const resend = new Resend('re_PPGs2r4c_P2F8G1wjUmAQZovg1zTq2jap');

async function test() {
  const response = await resend.emails.send({
    from: 'Kutok Mista <info@kutok-mista.com.ua>',
    to: ['vladprotsenko2@gmail.com'],
    subject: 'Test',
    html: '<p>test</p>'
  });
  console.log(response);
}

test();
