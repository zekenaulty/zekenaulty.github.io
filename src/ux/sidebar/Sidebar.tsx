import React, { Component } from 'react';
import './Sidebar.css';
import { Toggle } from './Toggle';
import { motion, useAnimate, stagger } from 'framer-motion';

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

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: 0.9,
      staggerDirection: -1
    }
  }
}

const item = {
  hidden: { opacity: 0, left: -1000 },
  show: { opacity: 1, left: 0 }
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
          className="toggle-button"
          isOpen={open}
          onClick={() => {
            this.setState({
              open: !open
            });
            document.body.style.setProperty('--overflow-type', open ? 'hidden' : 'auto');
          }}></Toggle>

        <motion.div
          className="sidebar-modal-bg"
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: open ? 1 : 0
          }}
          transition={{
            duration: 0.2
          }}>&nbsp;</motion.div>

        <motion.div
          className="bg-dark sidebar-modal"
          initial={{
            x: -500,
            opacity: 0,
            width: 92
          }}
          transition={{
            duration: 0.35,
            delayChildren: 0.9,
            staggerDirection: -1
          }}
          animate={{
            x: open ? 0 : -500,
            opacity: open ? 1 : 0,
            width: 92
          }}>
          <motion.nav
            variants={container}
            initial="hidden"
            animate="show">
            {
              links.map((l) => (
                <motion.nav
                  variants={item}
                  initial="hidden"
                  animate="show">
                  <motion.span
                    about={l.description}>
                    <motion.i className={l.faIcon}></motion.i>{l.text}
                  </motion.span>
                </motion.nav>)
              )
            }
          </motion.nav>
        </motion.div>
      </>
    );
  }
}

export default Sidebar;
