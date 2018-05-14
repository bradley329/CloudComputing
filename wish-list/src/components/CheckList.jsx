import React from 'react';
import {Jumbotron, Button, Grid, Row, Col} from 'react-bootstrap';
import CheckItem from './CheckItem.jsx';
import { db } from '../FireBaseService'

export default class CheckList extends React.Component{
  constructor(props) {
    super(props);
    
    this.state = {
      items: [],
      chosenIds: [],
      wishListId: null
    };
    this.bufferChosenIds = [];
  }

  addChosenIdToList(id) {
    // this.setState({chosenIds: this.state.chosenIds.push(id)});
    this.bufferChosenIds.push(id);
    console.log('added: ', id);
  }

  componentWillReceiveProps(nextProps) {
    console.log('receiving props!!!');
    if (this.props.checkItems !== nextProps.checkItems) {
      console.log('xian zai you le ba? ', nextProps.checkItems);
      this.updateItems(nextProps.checkItems);
    }
  }

  updateItems(checkItems) {
    let itemsBuffer = [];
    for (let i = 0; i < checkItems.length; i++) {
      const item = checkItems[i];
      itemsBuffer.push(<CheckItem key={i} id={item["id"]} name={item["name"]} price={item["price"]} addChosenIdToList={this.addChosenIdToList.bind(this)}/>);
    }
    this.setState({items: itemsBuffer});
  }

  submitInput(event) {
    this.setState({chosenIds: this.bufferChosenIds}, () => {
      // write the data to database
      let wishlist = {};
      let len = 0;
      for (let productId of this.state.chosenIds) {
        db.ref('products/' + productId).once('value', (snapshot) => {
          const product = snapshot.val();
          wishlist[productId] = {
            name: product.name,
            priceToGo: product.price
          };
          len++;
          if (len === this.state.chosenIds.length) {
            // push to database
            const id = db.ref('wishlist').push().key;
            console.log('wishlistId: ', id);
            this.setState({wishListId: id});
            db.ref('wishlists/' + id).set(wishlist);
          }
        });
      }
    });
    event.preventDefault();
  }

  componentDidUpdate() {
    this.bufferChosenIds = [];
  }

  render() {
    if (this.state.wishListId) {
      return (<div><label>Share this wishlist id: <b>{this.state.wishListId}</b> to your friends!</label></div>);
    } else {
      return (
        <Jumbotron>
          <Grid>
            <form onSubmit={this.submitInput.bind(this)}>
              {this.state.items}
              <div className="buttonBox">
                <Button type="submit" bsStyle='success'>Submit</Button>
              </div>
            </form>
          </Grid>
        </Jumbotron>
      );
    }
  }
}