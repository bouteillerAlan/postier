import React from 'react';
import styled from 'styled-components';
import { Flex, Text, Box, Separator } from '@radix-ui/themes';
import { GitHubLogoIcon, TwitterLogoIcon, HeartFilledIcon } from '@radix-ui/react-icons';

const FooterContainer = styled.footer`
  padding: 60px 0;
  background-color: var(--card);
  border-top: 1px solid var(--border);
`;

const FooterInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
`;

const FooterLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
`;

const FooterLink = styled.a`
  color: var(--muted);
  transition: color 0.2s;
  
  &:hover {
    color: var(--foreground);
  }
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background-color: var(--subtle);
  color: var(--muted);
  transition: all 0.2s;
  
  &:hover {
    background-color: var(--red);
    color: white;
  }
`;

const Footer: React.FC = () => {
  return (
    <FooterContainer>
      <FooterInner>
        <FooterLogo>
          <Box style={{ color: '#D95525', fontSize: '24px' }}>📮</Box>
          <Text size="5" weight="bold">Postier</Text>
        </FooterLogo>
        
        <Flex justify="between" wrap="wrap" gap="6">
          <Box style={{ flex: '1 1 300px', marginBottom: '32px' }}>
            <Text size="3" style={{ marginBottom: '16px' }}>
              A modern HTTP client built for developers.
            </Text>
            <Text size="2" style={{ color: 'var(--muted)', marginBottom: '24px' }}>
              Lightweight, fast, and privacy-respecting. No bloat, no mandatory accounts.
            </Text>
            
            <Flex gap="3">
              <SocialLink href="https://github.com/bouteillerAlan/postier" target="_blank" rel="noopener noreferrer">
                <GitHubLogoIcon width="20" height="20" />
              </SocialLink>
              <SocialLink href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <TwitterLogoIcon width="20" height="20" />
              </SocialLink>
            </Flex>
          </Box>
          
          <Flex gap="8" wrap="wrap">
            <Box>
              <Text size="3" weight="bold" style={{ marginBottom: '16px' }}>
                Product
              </Text>
              <Flex direction="column" gap="2">
                <FooterLink href="#features">Features</FooterLink>
                <FooterLink href="#technology">Technology</FooterLink>
                <FooterLink href="#download">Download</FooterLink>
              </Flex>
            </Box>
            
            <Box>
              <Text size="3" weight="bold" style={{ marginBottom: '16px' }}>
                Resources
              </Text>
              <Flex direction="column" gap="2">
                <FooterLink href="https://github.com/bouteillerAlan/postier" target="_blank" rel="noopener noreferrer">GitHub</FooterLink>
                <FooterLink href="https://github.com/bouteillerAlan/postier/issues" target="_blank" rel="noopener noreferrer">Issues</FooterLink>
                <FooterLink href="https://github.com/bouteillerAlan/postier/releases" target="_blank" rel="noopener noreferrer">Releases</FooterLink>
              </Flex>
            </Box>
            
            <Box>
              <Text size="3" weight="bold" style={{ marginBottom: '16px' }}>
                Contact
              </Text>
              <Flex direction="column" gap="2">
                <FooterLink href="https://github.com/bouteillerAlan" target="_blank" rel="noopener noreferrer">Alan Bouteiller</FooterLink>
                <FooterLink href="https://github.com/bouteillerAlan/postier/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer">Contributing</FooterLink>
                <FooterLink href="https://github.com/sponsors/bouteillerAlan" target="_blank" rel="noopener noreferrer">Sponsor</FooterLink>
              </Flex>
            </Box>
          </Flex>
        </Flex>
        
        <Separator size="4" style={{ margin: '32px 0' }} />
        
        <Flex justify="between" align="center" wrap="wrap" gap="4">
          <Text size="1" style={{ color: 'var(--muted)' }}>
            © {new Date().getFullYear()} Postier. All rights reserved.
          </Text>
          
          <Flex align="center" gap="1">
            <Text size="1" style={{ color: 'var(--muted)' }}>Made with</Text>
            <HeartFilledIcon color="var(--red)" />
            <Text size="1" style={{ color: 'var(--muted)' }}>by <a href="https://github.com/bouteillerAlan" style={{ color: 'var(--foreground)' }}>Alan Bouteiller</a></Text>
          </Flex>
        </Flex>
      </FooterInner>
    </FooterContainer>
  );
};

export default Footer;
