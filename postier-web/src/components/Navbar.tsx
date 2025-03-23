import React from 'react';
import styled from 'styled-components';
import { Flex, Text } from '@radix-ui/themes';
import { GitHubLogoIcon } from '@radix-ui/react-icons';

const NavContainer = styled.nav`
  height: 70px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  z-index: 100;
  border-bottom: 1px solid var(--border);
`;

const NavInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 18px;
`;

const LogoImage = styled.img`
  height: 24px;
  width: auto;
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 32px;
`;

const NavLink = styled.a`
  color: var(--muted);
  font-size: 14px;
  transition: color 0.2s;
  
  &:hover {
    color: var(--foreground);
  }
`;

const GitHubButton = styled.a`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--subtle);
  padding: 8px 16px;
  border-radius: 6px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--card);
  }
`;

const Navbar: React.FC = () => {
  return (
    <NavContainer>
      <NavInner>
        <Logo>
          <LogoImage src="/postier.svg" alt="Postier Logo" />
          <span>Postier</span>
        </Logo>
        
        <Flex align="center" gap="6">
          <NavLinks>
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#technology">Technology</NavLink>
            <NavLink href="#download">Download</NavLink>
          </NavLinks>
          
          <GitHubButton href="https://github.com/bouteillerAlan/postier" target="_blank" rel="noopener noreferrer">
            <GitHubLogoIcon />
            <Text size="2">Star on GitHub</Text>
          </GitHubButton>
        </Flex>
      </NavInner>
    </NavContainer>
  );
};

export default Navbar;
