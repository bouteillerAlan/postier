import React from 'react';
import styled from 'styled-components';
import { Box, Flex, Heading, Text, Card } from '@radix-ui/themes';
import { RocketIcon, LightningBoltIcon, MixIcon, LockClosedIcon } from '@radix-ui/react-icons';

const FeaturesContainer = styled.section`
  padding: 100px 0;
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 60px;
`;

const GradientText = styled.span`
  background: linear-gradient(90deg, var(--red) 0%, var(--pink) 50%, var(--purple) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
`;

const FeatureCard = styled(Card)`
  background-color: var(--card) !important;
  border: 1px solid var(--border) !important;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
  position: relative;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px -10px rgba(111, 54, 79, 0.3);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--yellow) 0%, var(--orange) 50%, var(--red) 100%);
  }
`;

const FeatureIcon = styled.div<{ color: string }>`
  background-color: ${props => props.color};
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
`;

const Features: React.FC = () => {
  const features = [
    {
      title: 'HTTP Request Support',
      description: 'Complete HTTP methods support with request body editor for various formats including JSON, XML, and form-data.',
      icon: <RocketIcon color="white" width="20" height="20" />,
      color: 'var(--red)'
    },
    {
      title: 'Lightweight & Fast',
      description: 'Built with speed in mind. No bloat, no mandatory user accounts, just what you need for HTTP testing.',
      icon: <LightningBoltIcon color="white" width="20" height="20" />,
      color: 'var(--orange)'
    },
    {
      title: 'Modern UI Design',
      description: 'Clean, modern interface with dark/light mode support, customizable themes, and accent colors.',
      icon: <MixIcon color="white" width="20" height="20" />,
      color: 'var(--yellow)'
    },
    {
      title: 'Privacy Focused',
      description: 'Your data stays local. Config and history are saved as text files that you can sync however you want.',
      icon: <LockClosedIcon color="white" width="20" height="20" />,
      color: 'var(--pink)'
    }
  ];

  return (
    <FeaturesContainer>
      <SectionHeader>
        <Text size="2" style={{ color: 'var(--orange)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
          Capabilities
        </Text>
        <Heading size="7" style={{ marginBottom: '16px' }}>
          Everything you need, <GradientText>nothing you don't</GradientText>
        </Heading>
        <Text size="4" style={{ color: 'var(--muted)', maxWidth: '550px', margin: '0 auto' }}>
          Postier focuses on being a lightweight, fast, and privacy-respecting HTTP client.
        </Text>
      </SectionHeader>

      <Flex gap="6" wrap="wrap">
        {features.map((feature, index) => (
          <Box key={index} style={{ flex: '1 1 250px', minWidth: '250px' }}>
            <FeatureCard size="3" style={{ height: '100%' }}>
              <FeatureIcon color={feature.color}>
                {feature.icon}
              </FeatureIcon>
              <Heading as="h3" size="4" style={{ marginBottom: '8px' }}>
                {feature.title}
              </Heading>
              <Text as="p" size="2" style={{ color: 'var(--muted)' }}>
                {feature.description}
              </Text>
            </FeatureCard>
          </Box>
        ))}
      </Flex>
    </FeaturesContainer>
  );
};

export default Features;
