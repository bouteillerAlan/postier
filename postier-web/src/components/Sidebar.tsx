import React from 'react';
import styled from 'styled-components';
import { Box, Text, Heading } from '@radix-ui/themes';
import { HomeIcon, LayersIcon, ClockIcon, GearIcon, PlusIcon } from '@radix-ui/react-icons';

const SidebarContainer = styled.div`
  width: 240px;
  height: 100vh;
  background-color: var(--card);
  border-right: 1px solid var(--border);
  padding: 16px 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const SidebarHeader = styled.div`
  padding: 0 16px 16px;
`;

const SidebarLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  
  svg {
    color: var(--orange);
  }
`;

const SidebarSection = styled.div`
  margin-bottom: 24px;
  padding: 0 8px;
`;

const SidebarSectionTitle = styled.div`
  padding: 0 8px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NavItem = styled.div<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 2px;
  transition: background-color 0.2s;
  background-color: ${props => props.active ? 'var(--subtle)' : 'transparent'};
  color: ${props => props.active ? 'var(--foreground)' : 'var(--muted)'};
  
  &:hover {
    background-color: var(--subtle);
  }
`;

const AddButton = styled.button`
  background: transparent;
  border: none;
  color: var(--muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
  
  &:hover {
    color: var(--foreground);
    background-color: var(--subtle);
  }
`;

const Footer = styled.div`
  margin-top: auto;
  padding: 16px;
  border-top: 1px solid var(--border);
`;

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate }) => {
  return (
    <SidebarContainer>
      <SidebarHeader>
        <SidebarLogo>
          <Box style={{ color: '#D95525', fontSize: '24px' }}>ud83dudce8</Box>
          <Heading size="4" style={{ fontWeight: 600 }}>Postier</Heading>
        </SidebarLogo>
      </SidebarHeader>
      
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <SidebarSection>
          <SidebarSectionTitle>
            <Text size="1" style={{ color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 500 }}>Main</Text>
          </SidebarSectionTitle>
          
          <NavItem active={activePage === 'home'} onClick={() => onNavigate('home')}>
            <HomeIcon />
            <Text size="2">Home</Text>
          </NavItem>
          
          <NavItem active={activePage === 'requests'} onClick={() => onNavigate('requests')}>
            <LayersIcon />
            <Text size="2">Requests</Text>
          </NavItem>
          
          <NavItem active={activePage === 'history'} onClick={() => onNavigate('history')}>
            <ClockIcon />
            <Text size="2">History</Text>
          </NavItem>
        </SidebarSection>
        
        <SidebarSection>
          <SidebarSectionTitle>
            <Text size="1" style={{ color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 500 }}>Collections</Text>
            <AddButton>
              <PlusIcon />
            </AddButton>
          </SidebarSectionTitle>
          
          <NavItem active={activePage === 'collection-api'} onClick={() => onNavigate('collection-api')}>
            <Text size="2">API Documentation</Text>
          </NavItem>
          
          <NavItem active={activePage === 'collection-auth'} onClick={() => onNavigate('collection-auth')}>
            <Text size="2">Authentication</Text>
          </NavItem>
        </SidebarSection>
      </div>
      
      <Footer>
        <NavItem onClick={() => onNavigate('settings')}>
          <GearIcon />
          <Text size="2">Settings</Text>
        </NavItem>
      </Footer>
    </SidebarContainer>
  );
};

export default Sidebar;
