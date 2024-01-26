import React, { Component } from 'react';
import { Offcanvas } from 'react-bootstrap';
import './Sidebar.css';
import { Toggle } from './Toggle';

interface Link {
  id: number;
  text: string;
  href: string;
  component: string;
  name: string;
  description: string;
  faIcon: string;
}

interface SidebarProps {
  onOpen?: () => void;
  onClose?: () => void;
}

interface SidebarState {
  open: boolean,
  links: Link[];
}

class Sidebar extends Component<SidebarProps, SidebarState> {
  constructor(props: SidebarProps) {
    super(props);
    this.state = {
      open: false,
      links: [],
    };
  }

  componentDidMount() {
    // Simulate loading the links from the JSON file
    fetch('/data/siteMap.json')
      .then((response) => response.json())
      .then((data) => {
        const sortedLinks = data.keys.map((key: string) => data.sections[key]) as Link[];
        sortedLinks.sort((a: Link, b: Link) => a.id - b.id);
        this.setState({
          links: sortedLinks
        });
      })
      .catch((error) => {
        console.error('Error loading links:', error);
      });
  }


  render() {
    const { open, links } = this.state;

    return (
      <>
        <Toggle
          isOpen={open}
          onClick={() => this.setState({
            open: !open
          })}></Toggle>
      </>
    );
  }
}

export default Sidebar;
