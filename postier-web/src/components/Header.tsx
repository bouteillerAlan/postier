import React from 'react';
import styled from 'styled-components';
import { Flex, Avatar, Text, Button } from '@radix-ui/themes';
import { MagnifyingGlassIcon, PlusIcon } from '@radix-ui/react-icons';

const HeaderContainer = styled.header`
  height: 60px;
  background-color: var(--card);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
`;

const SearchInput = styled.div`
  display: flex;
  align-items: center;
  background-color: var(--subtle);
  border-radius: 6px;
  padding: 8px 12px;
  width: 240px;
  transition: all 0.2s;
  
  &:focus-within {
    width: 300px;
    box-shadow: 0 0 0 2px var(--pink);
  }
  
  input {
    background: transparent;
    border: none;
    outline: none;
    color: var(--foreground);
    font-size: 14px;
    width: 100%;
    margin-left: 8px;
  }
`;

const ActionButton = styled(Button)`
  background-color: var(--red) !important;
  &:hover {
    background-color: var(--pink) !important;
  }
`;

interface HeaderProps {
  onNewRequest: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNewRequest }) => {
  return (
    <HeaderContainer>
      <Flex align="center" gap="4">
        <Text size="3" weight="medium">Requests</Text>
      </Flex>
      
      <Flex align="center" gap="4">
        <SearchInput>
          <MagnifyingGlassIcon color="var(--muted)" />
          <input placeholder="Search requests..." />
        </SearchInput>
        
        <ActionButton size="2" onClick={onNewRequest}>
          <PlusIcon width="16" height="16" />
          <Text>New Request</Text>
        </ActionButton>
        
        <Avatar
          size="2"
          src="https://github.com/bouteillerAlan.png"
          fallback="AB"
          radius="full"
          style={{ cursor: 'pointer' }}
        />
      </Flex>
    </HeaderContainer>
  );
};

export default Header;
