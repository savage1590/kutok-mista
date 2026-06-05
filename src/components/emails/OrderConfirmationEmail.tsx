import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Button,
  Row,
  Column,
} from '@react-email/components';

interface OrderConfirmationEmailProps {
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  shippingAddress: string;
  paymentMethod: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.kutok-mista.com.ua';

export const OrderConfirmationEmail = ({
  orderNumber,
  customerName,
  totalAmount,
  shippingAddress,
  paymentMethod,
  items,
}: OrderConfirmationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Ваше замовлення #{orderNumber} успішно оформлено!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Img
              src={`${baseUrl}/logo-black.svg`} // Or whatever the logo filename is. I will check the public folder later.
              width="150"
              height="auto"
              alt="Kutok Mista"
              style={logo}
            />
          </Section>

          <Heading style={heading}>Дякуємо за замовлення, {customerName}!</Heading>
          
          <Text style={paragraph}>
            Ми успішно отримали ваше замовлення <strong>#{orderNumber}</strong>. 
            Найближчим часом ми почнемо його комплектувати.
          </Text>

          <Section style={detailsSection}>
            <Heading as="h3" style={subheading}>Деталі замовлення</Heading>
            
            {items?.map((item, index) => (
              <Row key={index} style={itemRow}>
                <Column style={itemColumnName}>
                  <Text style={itemText}>{item.name}</Text>
                </Column>
                <Column style={itemColumnQty}>
                  <Text style={itemText}>{item.quantity} шт.</Text>
                </Column>
                <Column style={itemColumnPrice}>
                  <Text style={itemText}>{(item.price * item.quantity).toFixed(0)} ₴</Text>
                </Column>
              </Row>
            ))}

            <Hr style={hrSmall} />
            
            <Row style={totalRow}>
              <Column>
                <Text style={totalLabel}>Разом до оплати:</Text>
              </Column>
              <Column style={itemColumnPrice}>
                <Text style={totalPrice}>{totalAmount.toFixed(0)} ₴</Text>
              </Column>
            </Row>
          </Section>

          <Section style={infoSection}>
            <Heading as="h3" style={subheading}>Інформація про доставку та оплату</Heading>
            <Text style={infoText}><strong>Адреса доставки:</strong> {shippingAddress}</Text>
            <Text style={infoText}><strong>Спосіб оплати:</strong> {getPaymentLabel(paymentMethod)}</Text>
          </Section>

          <Section style={buttonSection}>
            <Button style={button} href={baseUrl}>
              Повернутися на сайт
            </Button>
          </Section>

          <Text style={footerText}>
            Якщо у вас виникли питання, ви можете відповісти на цей лист або зв'язатися з нашою підтримкою.
            <br />
            З повагою, команда Kutok Mista
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderConfirmationEmail;

function getPaymentLabel(method: string) {
  switch (method) {
    case 'cash': return 'Оплата при отриманні (накладений платіж)';
    case 'card': return 'Переказ на реквізити';
    case 'monopay': return 'Mono Pay / Картою онлайн';
    case 'liqpay': return 'LiqPay';
    default: return method;
  }
}

// --- Styles ---
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  maxWidth: '600px',
};

const headerSection = {
  padding: '20px 40px',
  borderBottom: '1px solid #e6ebf1',
  textAlign: 'center' as const,
};

const logo = {
  margin: '0 auto',
};

const heading = {
  fontSize: '24px',
  letterSpacing: '-0.5px',
  lineHeight: '1.3',
  fontWeight: '600',
  color: '#484848',
  padding: '24px 40px 0',
  margin: '0',
};

const paragraph = {
  margin: '0',
  padding: '16px 40px 24px',
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#525f7f',
};

const detailsSection = {
  padding: '20px 40px',
  backgroundColor: '#fbfcfd',
  borderTop: '1px solid #e6ebf1',
  borderBottom: '1px solid #e6ebf1',
};

const subheading = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#32325d',
  margin: '0 0 16px',
};

const itemRow = {
  marginBottom: '12px',
};

const itemColumnName = { width: '60%' };
const itemColumnQty = { width: '20%', textAlign: 'center' as const };
const itemColumnPrice = { width: '20%', textAlign: 'right' as const };

const itemText = {
  margin: '0',
  fontSize: '14px',
  color: '#525f7f',
};

const hrSmall = {
  borderColor: '#e6ebf1',
  margin: '16px 0',
};

const totalRow = {
  marginTop: '16px',
};

const totalLabel = {
  margin: '0',
  fontSize: '16px',
  fontWeight: '600',
  color: '#32325d',
};

const totalPrice = {
  margin: '0',
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#32325d',
  textAlign: 'right' as const,
};

const infoSection = {
  padding: '24px 40px',
};

const infoText = {
  margin: '0 0 8px',
  fontSize: '14px',
  color: '#525f7f',
  lineHeight: '1.5',
};

const buttonSection = {
  padding: '24px 40px',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#000000',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '15px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
};

const footerText = {
  padding: '0 40px',
  margin: '0',
  fontSize: '13px',
  color: '#8898aa',
  lineHeight: '1.6',
};
