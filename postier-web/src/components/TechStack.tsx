import React from 'react';
import styled from 'styled-components';
import { Flex, Heading, Text, Card, Box } from '@radix-ui/themes';

const TechContainer = styled.section`
  padding: 100px 0;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 60px;
`;

const GradientText = styled.span`
  background: linear-gradient(90deg, var(--orange) 0%, var(--red) 50%, var(--pink) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
`;

const TechCard = styled(Card)`
  background-color: var(--card) !important;
  border: 1px solid var(--border) !important;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 24px !important;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const TechLogo = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const BackgroundGlow = styled.div`
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(204, 59, 44, 0.15) 0%, rgba(10, 10, 11, 0) 70%);
  z-index: -1;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -70%);
`;

const TechStack: React.FC = () => {
  const technologies = [
    { name: 'React', icon: '⚛️', description: 'Frontend framework with TypeScript for type safety' },
    { name: 'Tauri', icon: '🦀', description: 'Desktop framework for building lightweight apps' },
    { name: 'Radix UI', icon: '🎨', description: 'Unstyled, accessible UI components' },
    { name: 'HTTP Client', icon: '🌐', description: 'Built-in Tauri plugin for HTTP requests' }
  ];

  return (
    <TechContainer id="technology">
      <BackgroundGlow />
      
      <SectionHeader>
        <Text size="2" style={{ color: 'var(--pink)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
          Tech Stack
        </Text>
        <Heading size="7" style={{ marginBottom: '16px' }}>
          Built with <GradientText>modern technologies</GradientText>
        </Heading>
        <Text size="4" style={{ color: 'var(--muted)', maxWidth: '550px', margin: '0 auto' }}>
          Postier leverages powerful, open-source technologies to deliver a fast and reliable experience.
        </Text>
      </SectionHeader>

      <Flex gap="6" wrap="wrap" justify="center">
        {technologies.map((tech, index) => (
          <Box key={index} style={{ flex: '1 1 240px', maxWidth: '280px' }}>
            <TechCard>
              <TechLogo>{tech.icon}</TechLogo>
              <Heading as="h3" size="5" style={{ marginBottom: '8px' }}>
                {tech.name}
              </Heading>
              <Text as="p" size="2" style={{ color: 'var(--muted)' }}>
                {tech.description}
              </Text>
            </TechCard>
          </Box>
        ))}
      </Flex>
    </TechContainer>
  );
};

export default TechStack;
