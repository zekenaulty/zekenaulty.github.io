import React, { Component } from 'react';
import { Offcanvas } from 'react-bootstrap';
import './Sidebar.css';

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
  onClose: () => void;
}

interface SidebarState {
  show: boolean;
  loading: boolean;
  links: Link[];
}

class Sidebar extends Component<SidebarProps, SidebarState> {
  constructor(props: SidebarProps) {
    super(props);
    this.state = {
      show: false,
      loading: true,
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
          links: sortedLinks,
          loading: false,
        });
      })
      .catch((error) => {
        console.error('Error loading links:', error);
        this.setState({ loading: false });
      });
  }

  handleToggleSidebar = () => {
    this.setState((prevState) => ({
      show: !prevState.show,
    }));
  };

  render() {
    const { show, loading, links } = this.state;

    return (
      <>
        {/* Toggle Button */}
        <button className={`btn toggle-button ${show ? 'sidebar-open' : ''}`} onClick={this.handleToggleSidebar}>
          <span className="toggle-icon">☰</span>
        </button>

        {/* Sidebar */}
        <Offcanvas show={show} onHide={this.props.onClose} className="offcanvas-container">
          <Offcanvas.Body>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <nav>
                <ul className="nav flex-column">
                  {links.map((link) => (
                    <li key={link.id} className="nav-item">
                      <a href={link.href} className={`nav-link`}>
                        {link.faIcon && <i className={`${link.faIcon}`}/>}
                        {link.text}
                        {link.description && <span className="sr-only">{link.description}</span>} {/* Accessibility info */}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </Offcanvas.Body>
        </Offcanvas>
      </>
    );
  }
}

export default Sidebar;
