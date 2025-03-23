import React from 'react';
import styled from 'styled-components';
import { Flex, Heading, Text, Button, Box, Card } from '@radix-ui/themes';
import { DownloadIcon, DesktopIcon, CodeIcon } from '@radix-ui/react-icons';

const DownloadContainer = styled.section`
  padding: 100px 0;
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
  position: relative;
`;

const DownloadCard = styled(Card)`
  background-color: var(--card) !important;
  border: 1px solid var(--border) !important;
  padding: 32px !important;
  margin-top: 60px;
  position: relative;
  overflow: hidden;
`;

const GlowEffect = styled.div`
  position: absolute;
  top: -100px;
  right: -100px;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(239, 207, 74, 0.15) 0%, rgba(10, 10, 11, 0) 70%);
  z-index: 0;
`;

const DownloadOption = styled(Card)`
  background-color: var(--subtle) !important;
  border: 1px solid var(--border) !important;
  padding: 24px !important;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.2s;
  position: relative;
  z-index: 1;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px -5px rgba(111, 54, 79, 0.2);
    border-color: var(--pink);
  }
`;

const OsIcon = styled.div`
  font-size: 24px;
  margin-bottom: 16px;
`;

const DownloadButton = styled(Button)`
  background-color: var(--red) !important;
  margin-top: 16px;
  width: 100%;
  
  &:hover {
    background-color: var(--pink) !important;
  }
`;

const VersionTag = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: rgba(204, 59, 44, 0.2);
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  color: var(--red);
`;

const Download: React.FC = () => {
  const platforms = [
    { name: 'Windows', icon: <DesktopIcon width="36" height="36" />, version: '0.1.4' },
    { name: 'macOS', icon: <DesktopIcon width="36" height="36" />, version: '0.1.4' },
    { name: 'Linux', icon: <CodeIcon width="36" height="36" />, version: '0.1.4' }
  ];

  return (
    <DownloadContainer id="download">
      <Text size="2" style={{ color: 'var(--yellow)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
        Get Started
      </Text>
      
      <Heading size="7" style={{ marginBottom: '16px' }}>
        Download Postier
      </Heading>
      
      <Text size="4" style={{ color: 'var(--muted)', maxWidth: '550px', margin: '0 auto 40px' }}>
        Available for all major platforms. 100% free and open-source.
      </Text>
      
      <DownloadCard>
        <GlowEffect />
        
        <Flex gap="6" wrap="wrap" justify="center">
          {platforms.map((platform, index) => (
            <Box key={index} style={{ flex: '1 1 240px', maxWidth: '280px' }}>
              <DownloadOption>
                <VersionTag>v{platform.version}</VersionTag>
                <OsIcon>{platform.icon}</OsIcon>
                <Heading as="h3" size="4">
                  {platform.name}
                </Heading>
                <Text as="p" size="2" style={{ color: 'var(--muted)', margin: '8px 0' }}>
                  64-bit installer
                </Text>
                <DownloadButton size="3">
                  <DownloadIcon width="16" height="16" />
                  <Text>Download</Text>
                </DownloadButton>
              </DownloadOption>
            </Box>
          ))}
        </Flex>
        
        <Text size="2" style={{ color: 'var(--muted)', marginTop: '32px' }}>
          All downloads are available on the <a href="https://github.com/bouteillerAlan/postier/releases" style={{ color: 'var(--yellow)', textDecoration: 'underline' }}>GitHub releases page</a>.
        </Text>
      </DownloadCard>
    </DownloadContainer>
  );
};

export default Download;
