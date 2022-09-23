import HostLayout from '@/components/layouts/HostLayout';
import { useState, useEffect } from 'react';
import { Table, Tag, Space, Skeleton, Rate } from 'antd'
import { useRouter } from 'next/router';
import ReviewModal from '@/components/review/ReviewModal'
import { StringNullableChain } from 'lodash';
import moment from 'moment'
import { Base64 } from 'js-base64';
import { useCookies } from 'react-cookie';
import { DatabaseTwoTone } from '@ant-design/icons';
import getToken from '@/lib/helpers/getToken';

interface EventType {
	_id: string;
	location: string;
    host: string;
	ticketPrice: number;
    maxGuests: number;
	title: string;
	startDate: string;
	endDate: string;
	image: string;
    reviews: [];
	tags: string[];
    avgRating: number;
	__v: number;
}

interface ReviewType {
  _id: string;
  eid: string;
  reviewer: string;
  review: string;
  rating: number;
}

/*
  TODO:

  - Need to look at events hosted by the host, => need to populate the reviews table
  -
*/

const PastEventsComponent = ({loading}) => {
    const router = useRouter();
    const [data, setData] = useState<EventType[] | undefined>();
    const [isLoading, setLoading] = useState(false);
    const [cookies] = useCookies(['userObj']);
    const [reviewData, setReviewData] = useState <ReviewType[] | undefined>();

  // This useEffect 'hook' with an empty array means it runs the code under
	// as soon as the page loads
	useEffect(() => {
		// While waiting for the server to send the data, show a loading message
    const token = Base64.encode(JSON.stringify(cookies['userObj']));
		setLoading(true);
		fetch('http://localhost:2102/hostevents?', {method: 'GET', headers: {
      'Authorization': `${getToken(cookies['userObj'])}`
    }})
			// The response is a JSON object, so we can use .json() to parse it
			.then((res) => res.json())
			// Set the data to the parsed JSON object
			.then((data) => {
				setData(data);
        setReviewData(data.reviews)
        // console.log('review data', data[0].reviews)
				setLoading(false);
			});
	}, []);

  // TODO: Need to load reviews for each event
  const expandedRowRender = (_, index: number) => {
    const columns = [
      {
        title: 'Stars',
        key: 'rating',
        dataIndex: 'rating',
        render: (rating) => {
          return (
            <>
              <Rate disabled value = {rating}/>
            </>
          )
        }
      },
      {
        title: 'Description',
        key: 'review',
        dataIndex: 'review'
      },
      {
        title: 'By',
        key: 'reviewer',
        dataIndex: 'reviewer'
      }
    ];

    // This looks for reviews in an event, and if there is populate the table with these reviews
    const dataSource = [];
    var size = data.length
        var review_size = data[index].reviews.length;
        if (review_size > 0) {
          for (let x = 0; x < review_size; ++x) {
            dataSource.push({
              rating: data[index].reviews[x].rating,
              review: data[index].reviews[x].review,
              reviewer: data[index].reviews[x].reviewer.firstName
            })
          }
        }




    return <Table columns={columns} dataSource={dataSource} pagination={false}/>;
  }



  const columns = [
    {
      title: 'Name',
      dataIndex: 'title',
      key: 'title',
      render: text => <a>{text}</a>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Date',
      render: (_,data) => {return <span>{moment(data.startDate).format('DD MMMM YYYY')}</span>},
      key: 'startDate',
    },
    {
        title: 'Location',
        dataIndex: 'location',
        key: 'location',
    },
    {
      title: 'Avg Rating',
      dataIndex: 'avgRating',
      key: 'avgRating',
      render: (avgRating) => {
        return (
          <>
            <Rate style={{width: '200px'}} disabled value = {avgRating}/>
          </>
        )
      }
    },
  ];
  
  if (loading) {
		return <Skeleton active />;
	}
    // Events needed a key for nested tables to work so this is how it's done.
    const dataSource = [];
    var size = data?.length;
    if (size)
    for(let i = 0; i < size; ++i) {
      //console.log(i, data[i].title)
      if (data[i].avgRating != null) {
        dataSource.push({
          key: data[i]._id,
          title: data[i].title,
          id: data[i]._id,
          description: data[i].description,
          startDate: data[i].startDate,
          location: data[i].location,
          avgRating: data[i].avgRating
        })
      } else {
        dataSource.push({
          key: data[i]._id,
          title: data[i].title,
          id: data[i]._id,
          description: data[i].description,
          startDate: data[i].startDate,
          location: data[i].location,
          avgRating: "Unrated"
        })
      }
    }
    return (
        <>
        <Table rowKey={(record) => record.id}  columns={columns} dataSource={dataSource} expandable={{ expandedRowRender }}/>
        </>
    )
};

export default PastEventsComponent