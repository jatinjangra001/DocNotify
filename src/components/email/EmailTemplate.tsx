import * as React from 'react';
import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Link,
    Preview,
    Text,
} from '@react-email/components';

interface EmailTemplateProps {
    documentTitle: string;
    message: string;
    type: 'EXPIRY_WARNING' | 'DOCUMENT_EXPIRED' | 'REMINDER_ENABLED' | 'REMINDER_DISABLED';
    previewText: string;
}

export const EmailTemplate = ({
    documentTitle,
    message,
    type,
    previewText,
}: EmailTemplateProps) => {
    const getActionText = () => {
        switch (type) {
            case 'EXPIRY_WARNING':
                return 'View Document';
            case 'DOCUMENT_EXPIRED':
                return 'Manage Document';
            default:
                return 'Go to Dashboard';
        }
    };

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={heading}>Document Notification</Heading>
                    <Text style={text}>{message}</Text>
                    <Text style={documentTitleStyle}> {/* Use the renamed style here */}
                        Document: {documentTitle}
                    </Text>
                    <Link
                        href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/docs`}
                        style={button}
                    >
                        {getActionText()}
                    </Link>
                    <Text style={footer}>
                        This is an automated message. Please do not reply to this email.
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

// Your styles remain unchanged
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
};

const heading = {
    fontSize: '24px',
    letterSpacing: '-0.5px',
    lineHeight: '1.3',
    fontWeight: '400',
    color: '#484848',
    padding: '17px 0 0',
};

const text = {
    margin: '0 0 10px',
    color: '#484848',
    fontSize: '16px',
    lineHeight: '24px',
};

const documentTitleStyle = { // Renamed style object
    fontSize: '14px',
    color: '#687087',
    margin: '16px 0',
};

const button = {
    backgroundColor: '#5469d4',
    borderRadius: '5px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    width: '230px',
    padding: '14px 7px',
    margin: '24px auto',
};

const footer = {
    color: '#8898aa',
    fontSize: '12px',
    lineHeight: '16px',
};
