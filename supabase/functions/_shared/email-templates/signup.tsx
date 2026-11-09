/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head>
      <style>{darkModeCss}</style>
    </Head>
    <Preview>Bem-vinda ao {siteName}! Confirme seu e-mail</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Bem-vinda ao clube, extraordinária 👑</Heading>
        <Text style={text}>
          Que alegria ter você no{' '}
          <Link href={siteUrl} style={link}>
            <strong>{siteName}</strong>
          </Link>
          !
        </Text>
        <Text style={text}>
          Para liberar seu primeiro acesso, confirme seu e-mail (
          <Link href={`mailto:${recipient}`} style={link}>
            {recipient}
          </Link>
          ) tocando no botão abaixo:
        </Text>
        <Button className="dm-btn" style={button} href={confirmationUrl}>
          Ativar meu acesso
        </Button>
        <Text style={footer}>
          Se você não criou uma conta, pode ignorar este e-mail.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Raleway', Arial, sans-serif" }
const container = { padding: '32px 28px', backgroundColor: '#FAF8F5', border: '1px solid #EADFD8', borderRadius: '20px', margin: '24px auto', maxWidth: '520px' }
const h1 = {
  fontSize: '22px',
  fontWeight: 'normal' as const,
  color: '#28201A',
  fontFamily: "'Playfair Display', Georgia, serif",
  margin: '0 0 20px',
}
const text = {
  fontSize: '14px',
  color: '#6F625A',
  lineHeight: '1.5',
  margin: '0 0 25px',
}
const link = { color: 'inherit', textDecoration: 'underline' }
const button = {
  backgroundColor: '#C57D5B',
  color: '#ffffff',
  fontSize: '14px',
  border: '1px solid #C57D5B',
  borderRadius: '999px',
  padding: '12px 20px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#A09287', margin: '30px 0 0' }
// Rendered as a text child, which React may HTML-escape: keep this CSS free of >, &, and quotes.
const darkModeCss = `
  @media (prefers-color-scheme: dark) {
    .dm-btn { background-color: #C57D5B !important; color: #ffffff !important; }
  }
  [data-ogsc] .dm-btn { background-color: #C57D5B !important; color: #ffffff !important; }
  [data-ogsb] .dm-btn { background-color: #C57D5B !important; color: #ffffff !important; }
`
