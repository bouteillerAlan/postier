import React from 'react';
import styled from 'styled-components';
import { Heading, Text, Button, Flex } from '@radix-ui/themes';
import { ArrowRightIcon } from '@radix-ui/react-icons';

const HeroContainer = styled.section`
  padding: 120px 0 80px;
  text-align: center;
  max-width: 900px;
  margin: 0 auto;
`;

const GradientText = styled.span`
  background: linear-gradient(90deg, var(--yellow) 0%, var(--orange) 50%, var(--red) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
`;

const ActionButton = styled(Button)`
  background-color: var(--red) !important;
  &:hover {
    background-color: var(--pink) !important;
  }
`;

const SecondaryButton = styled(Button)`
  background-color: var(--subtle) !important;
  border: 1px solid var(--border) !important;
  &:hover {
    background-color: var(--card) !important;
  }
`;

const HeroImage = styled.div`
  margin-top: 60px;
  position: relative;
  
  img {
    width: 100%;
    height: auto;
    border-radius: 8px;
    box-shadow: 0 20px 80px -20px rgba(111, 54, 79, 0.5);
    border: 1px solid var(--border);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(180deg, rgba(10, 10, 11, 0) 0%, rgba(10, 10, 11, 1) 100%);
    pointer-events: none;
    border-radius: 8px;
  }
`;

const Hero: React.FC = () => {
  return (
    <HeroContainer>
      <Heading as="h1" size="9" style={{ marginBottom: '24px', lineHeight: 1.1 }}>
        A <GradientText>modern</GradientText> HTTP client<br />
        built for developers
      </Heading>
      
      <Text size="5" style={{ color: 'var(--muted)', maxWidth: '650px', margin: '0 auto 40px' }}>
        Postier is a lightweight, privacy-focused alternative to Postman.
        Open-source, cross-platform, and designed for speed.
      </Text>
      
      <Flex gap="4" justify="center">
        <ActionButton size="4">
          <Text>Download Postier</Text>
          <ArrowRightIcon width="18" height="18" />
        </ActionButton>
        
        <SecondaryButton size="4">
          <Text>Explore GitHub</Text>
        </SecondaryButton>
      </Flex>
      
      <HeroImage>
        <img src="/screenshot.png" alt="Postier interface showing an HTTP request" />
      </HeroImage>
    </HeroContainer>
  );
};

export default Hero;
