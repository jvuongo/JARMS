import styled from 'styled-components';
import { CaretUpOutlined, CaretDownOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Typography, Space, Tooltip, Form, Popconfirm } from 'antd';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import getToken from '@/lib/helpers/getToken';
import { useRouter } from 'next/router';
import moment from 'moment';
import UserModal from '@/components/user/UserModal';

const { Text } = Typography;

const CommentContainer = styled.div`
    margin-left: 50px !important;
    margin-right: 15px !important;
`

const SingleCommentContainer = styled.div`
    margin-bottom: 20px !important;
    display: flex !important;
`

const SmallInfoText = styled(Text)`
    color: gray !important;
    font-size: 0.8em !important;
`

const DateInfoText = styled(SmallInfoText)`
    cursor: default !important;
`

const UserInfoText = styled(Text)`
    color: #C43444 !important;
    font-size: 0.8em !important;
    font-weight: bold !important;
    cursor: -webkit-pointer !important;
    cursor: pointer !important;
    &:hover {
        text-decoration: underline !important;
      }
`

const SmallClickableText = styled(SmallInfoText)`
    cursor: pointer !important;
    &:hover {
        text-decoration: underline !important;
      }
`

const VoteArrowsContainer = styled(Space)`
    margin-top: 6px !important;
`
const CommentMainText = styled(Text)`
    color: black !important;
`

const CommentMainDeleted = styled(Text)`
    color: gray !important;
`

const CommentProfilePicture = styled(Avatar)`
    margin-top: 13px !important;
    margin-right: 15px !important;
    color: white !important;
`

const ReplyContainer = styled.div`
    margin-left: 100px !important;
    margin-bottom: 20px !important;
`

const CommentTextInput = styled.textarea`
    padding: 5px !important;
    resize: both !important;
    // constrain textarea to container div
    max-width: 100% !important;
    min-height: 60px !important;
    margin-top: -10px !important;
    margin-bottom: -20px !important;
    // change focus border colour to meetic red
    &:focus {
        outline: none !important;
        border: 1px solid #C43444 !important;
        box-shadow: 0 0 3px #C43444 !important;
        -moz-box-shadow: 0 0 3px #C43444 !important;
        -webkit-box-shadow: 0 0 3px #C43444 !important;
    }
`

interface CommentProps {
    comment: String;
    reloadComments: () => void;
}

interface UserInfoType {
    _id: string;
    firstName: string;
    lastName: string;
    avatar: String;
}

const Comment = ({ comment, reloadComments }: CommentProps) => {
    const router = useRouter();
    const [userData, setUserData] = useState<UserInfoType | undefined>();
    const [showReplyForm, setShowReplyForm] = useState<boolean | undefined>();
    const [showEditForm, setShowEditForm] = useState<boolean | undefined>();
    const [textAreaValue, setTextAreaValue] = useState<string | undefined>();
    const [form] = Form.useForm();


    // variables and helper function for view user profile modal
    const [userModalVisible, setUserModalVisible] = useState(false);
	const [userModalData, setUserModalData] = useState();
    function showUser(user: any) {
		setUserModalData(user)
		setUserModalVisible(true)
	}

    // JSON.parse acts on type 'string', but comment prop is of the wrapper object type 'String'
    // so first we need to stringify.
    let commentData = JSON.parse(JSON.stringify(comment));

    // get cookies for logged in user id
    const [cookies] = useCookies(['userObj']);

    // this useEffect runs whenever comment data is updated
    // get name of user associated with comment
    useEffect(() => {
        let uid = JSON.parse(JSON.stringify(comment)).user;
        // console.log("uid = " + uid);

        // only fetch user information if comment has not been deleted
        if (uid !== "") {
            // Make fetch request
            fetch('http://localhost:2102/user?uid=' + uid, {method: 'GET', headers: {
                'Authorization': `${getToken(cookies['userObj'])}`
            }})
                // parse response JSON object
                .then((res) => res.json())
                // Set userData to the parsed JSON object
                .then((userData) => {

                    setUserData(userData);
                });
        }
    }, [comment]);

    // handle reply form submission
    const submitReply = async (values: any) => {
        // only submit if reply textarea is not empty
        if (values.replyText) {
            const { eid } = router.query;
            let replyData = {
                _id: Math.floor(Math.random() * Date.now()),
                points: 1,
                createdAt: new Date(),
                text: values.replyText,
                user: cookies.userObj._id,
                comments: []
            }
            let replyingToID = commentData._id;

            // console.log("SUBMITTED");
            // console.log("replyData = " + JSON.stringify(replyData));
            // console.log("replyingToID = " + replyingToID);

            fetch('http://localhost:2102/event?_id=' + eid, {
                method: 'PATCH', 
                headers: {
			        'Authorization': `${getToken(cookies['userObj'])}`,
                    'Content-Type': 'application/json',
	    	    },
                body: JSON.stringify({
                    commentType: "reply",
                    replyData: replyData,
                    replyingToID: replyingToID,
                }),
            }).then(() => {
                // hide reply form
                setShowReplyForm(false);
                // reset value of reply form textarea
                setTextAreaValue("");
                form.resetFields()

                // reload comment section
                reloadComments();
            });
        }
	};

    // handle delete comment
    const deleteComment = async () => {
        const { eid } = router.query;
        let commentDeleteID = commentData._id;

        fetch('http://localhost:2102/event?_id=' + eid, {
            method: 'PATCH', 
            headers: {
                'Authorization': `${getToken(cookies['userObj'])}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                commentType: "delete",
                commentDeleteID: commentDeleteID,
            }),
        }).then(() => {
            // reload comment section
            reloadComments();
        });
	};

    // handle edit comment
    const submitEdit = async (values: any) => {
        // only submit if edit textarea is not empty
        if (values.editText) {
            const { eid } = router.query;
            let commentEditID = commentData._id;

            fetch('http://localhost:2102/event?_id=' + eid, {
                method: 'PATCH', 
                headers: {
                    'Authorization': `${getToken(cookies['userObj'])}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    commentType: "edit",
                    commentEditID: commentEditID,
                    newText: values.editText,
                }),
            }).then(() => {
                // hide edit form
                setShowEditForm(false);
                // reload comment section
                reloadComments();
            });
        }
	};

    // get placeholder text for reply form
    function getReplyTextPlaceholder () {
        if (commentData.user !== "") {
            return "Reply to " + userData?.firstName + " " + userData?.lastName;
        } else {
            return "Reply to comment";
        }
    }

    return (
        <>
            {/* User Profile Modal */}
            <UserModal visible={userModalVisible} setModalVisibe={setUserModalVisible} data={userModalData} />

            {/* Render comment with data from commentData */}
            <CommentContainer>
                <SingleCommentContainer>

                    {/* Stretch feature: Comment voting + sort by score */}
                    {/* <VoteArrowsContainer direction="vertical">
                        <CaretUpOutlined style={{ fontSize: '36px', color: 'gray' }} />
                        <CaretDownOutlined style={{ fontSize: '36px', color: 'gray', marginTop: '-70px' }} />
                    </VoteArrowsContainer> */}

                    <CommentProfilePicture
                        size={54}
                        src={
                            userData?.avatar ??
                            'https://res.cloudinary.com/dwiv2vrtr/image/upload/v1648973068/blank_profile_image_goz124.png'
                        }
                    />

                    <Space direction="vertical">
                        <Space direction="horizontal">
                            {/* Show user who left comment, otherwise show 'deleted'  */}
                            {(commentData.user !== "") ? (
                            <UserInfoText onClick={() => { showUser(userData) }}>
                                {userData?.firstName} {userData?.lastName}
                            </UserInfoText>
                            ) : (
                                <SmallInfoText>deleted</SmallInfoText>
                            )}
                            {/* Stretch feature: points */}
                            {/* <SmallInfoText>{commentData.points} points</SmallInfoText> */}
                            <Tooltip title={moment(commentData.createdAt).format('DD MMMM YYYY')}>
                                <DateInfoText>{moment(commentData.createdAt).fromNow()}</DateInfoText>
                            </Tooltip>
                        </Space>

                        {/* Make text gray if comment has been deleted */}
                        {(commentData.user !== "") ? (
                            <CommentMainText>{commentData.text}</CommentMainText>
                        ) : (
                            <CommentMainDeleted>{commentData.text}</CommentMainDeleted>
                        )}

                        <Space direction="horizontal">
                            <SmallClickableText strong onClick={() => { setShowReplyForm(true); setShowEditForm(false) }}>Reply</SmallClickableText>
                            {/* Stretch feature: report comment + host moderation tools */}
                            {/* <SmallClickableText>Report</SmallClickableText> */}
                            {/* Conditionally render "edit" and "delete" button if comment was left by logged in user */}
                            {(cookies.userObj?._id === commentData.user) && (
                                <>
                                    <SmallClickableText onClick={() => { setShowEditForm(true); setShowReplyForm(false) }}>Edit</SmallClickableText>
                                    <Popconfirm
                                        title="Are you sure you want to delete this comment?"
                                        onConfirm={deleteComment}
                                        okText="Yes"
                                        cancelText="No"
                                    >
                                        <SmallClickableText onClick={() => {}}>Delete</SmallClickableText>
                                    </Popconfirm>
                                </>
                            )}
                        </Space>
                    </Space>
                </SingleCommentContainer>

                {/* Conditionally render reply form */}
                {showReplyForm && (
                    <ReplyContainer>
                        <Form requiredMark={false} onFinish={submitReply} id="replyForm" form={form}>
                            <Form.Item
                                name="replyText"
                            >
                                <CommentTextInput placeholder={getReplyTextPlaceholder()} rows={4} cols={50} autoFocus>
                                    {textAreaValue}
                                </CommentTextInput>
                            </Form.Item>
                            <Space direction="horizontal" style={{marginTop: "-40px", }}>
                                <Button type="default" style={{alignItems:'center',marginTop:40}}
                                    htmlType="submit">
                                    <Text strong>Save</Text>
                                </Button>
                                <Button type="default" style={{alignItems:'center',marginTop:40}}
                                    onClick={()=> {setShowReplyForm(false)}}>
                                    <Text>Cancel</Text>
                                </Button>
                            </Space>
                        </Form>
                    </ReplyContainer>
                )}

                {/* Conditionally render comment edit form */}
                {showEditForm && (
                    <ReplyContainer>
                        <Form requiredMark={false} onFinish={submitEdit} id="replyForm" form={form}>
                            <Form.Item
                                name="editText"
                            >
                                <CommentTextInput defaultValue={commentData.text} rows={4} cols={50} autoFocus></CommentTextInput>
                            </Form.Item>
                            <Space direction="horizontal" style={{marginTop: "-40px", }}>
                                <Button type="default" style={{alignItems:'center',marginTop:40}}
                                    htmlType="submit">
                                    <Text strong>Save</Text>
                                </Button>
                                <Button type="default" style={{alignItems:'center',marginTop:40}}
                                    onClick={()=> {setShowEditForm(false)}}>
                                    <Text>Cancel</Text>
                                </Button>
                            </Space>
                        </Form>
                    </ReplyContainer>
                )}

                {
                    // map through comments field in comment, recursively render more Comment components
                    commentData.comments.map((comment) =>
                        <Comment reloadComments = {() => {reloadComments()}} comment={comment} />
                    )
                }

            </CommentContainer>
        </>
    )

}

export default Comment;