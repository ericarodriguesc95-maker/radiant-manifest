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

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head>
      <style>{darkModeCss}</style>
    </Head>
    <Preview>Seu acesso ao {siteName} está pronto</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Seu primeiro acesso chegou 👑</Heading>
        <Text style={text}>
          Você foi convidada para o{' '}
          <Link href={siteUrl} style={link}>
            <strong>{siteName}</strong>
          </Link>
          . Toque no botão abaixo para criar sua senha e começar sua jornada de extraordinária.
        </Text>
        <Button className="dm-btn" style={button} href={confirmationUrl}>
          Fazer meu primeiro acesso
        </Button>
        <Text style={footer}>
          Se você não esperava este convite, pode ignorar este e-mail.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

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
