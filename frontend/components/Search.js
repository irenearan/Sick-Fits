import Downshift from 'downshift';
import Router from 'next/router';
import styled from 'styled-components';
import debounce from 'lodash.debounce';
import { client } from '../lib/withData';
import { SEARCH_ITEMS_QUERY } from '../queries';

function routeToItem(item) {
  Router.push({
    pathname: '/item',
    query: {
      id: item.id,
    },
  });
}

const DropDown = styled.div`
  position: absolute;
  width: 100%;
  z-index: 2;
  border: 1px solid ${props => props.theme.lightgrey};
`;

const DropDownItem = styled.div`
  border-bottom: 1px solid ${props => props.theme.lightgrey};
  background: ${props => (props.highlighted ? '#f7f7f7' : 'white')};
  padding: 1rem;
  transition: all 0.2s;
  ${props => (props.highlighted ? 'padding-left: 2rem;' : null)};
  display: flex;
  align-items: center;
  border-left: 10px solid ${props => (props.highlighted ? props.theme.lightgrey : 'white')};
  img {
    margin-right: 10px;
  }
`;

const SearchStyles = styled.div`
  position: relative;
  input {
    width: 100%;
    padding: 10px;
    border: 0;
    font-size: 2rem;
    &.loading {
      background: red;
    }
  }
`;

class AutoComplete extends React.Component {
  state = {
    items: [],
    loading: false,
  };
  onChange = debounce(async e => {
    if (!e.target.value) {
      return this.setState({ items: [] });
    }
    this.setState({ loading: true });
    const res = await client.query({
      query: SEARCH_ITEMS_QUERY,
      variables: { searchTerm: e.target.value },
    });
    this.setState({ items: res.data.items, loading: false });
  }, 350);

  render() {
    return (
      <SearchStyles>
        <Downshift onChange={routeToItem} itemToString={i => (i === null ? '' : i.title)}>
          {({ getInputProps, getItemProps, isOpen, inputValue, highlightedIndex }) => (
            <div>
              {/* This is the searchInput */}
              <input
                {...getInputProps({
                  placeholder: 'Search For Item',
                  id: 'search',
                  className: this.state.loading ? 'loading' : '',
                  onChange: e => {
                    e.persist();
                    this.onChange(e);
                  },
                })}
              />
              {/* This is the Dropdown */}
              {isOpen && (
                <DropDown>
                  {this.state.items.map((item, index) => (
                    <DropDownItem
                      {...getItemProps({ item })}
                      key={item.id}
                      highlighted={highlightedIndex === index}
                    >
                      <img width="50" src={item.image} alt={item.title} />
                      {item.title}
                    </DropDownItem>
                  ))}
                  {/* Found Nothing State */}
                  {!this.state.items.length && (
                    <DropDownItem>Nothing Found for {inputValue}...</DropDownItem>
                  )}
                </DropDown>
              )}
            </div>
          )}
        </Downshift>
      </SearchStyles>
    );
  }
}

export default AutoComplete;