import Comment from '@/components/event/Comment';
import { useEffect, useState } from 'react';
import { Avatar, Button, Typography, Space, Tooltip, Form, Input } from 'antd';
import styled from 'styled-components';
import { useCookies } from 'react-cookie';
import getToken from '@/lib/helpers/getToken';
import { useRouter } from 'next/router';


const { Text, Title } = Typography;

const CommentContainer = styled.div`
    margin-left: 50px;
    margin-bottom: 20px;
`

const CommentTextInput = styled.textarea`
    padding: 5px;
    resize: both;
    // constrain textarea to container div
    max-width: 100%;
    min-height: 60px;
    margin-top: -10px;
    margin-bottom: -20px;
    // change focus border colour to meetic red
    &:focus {
        outline: none !important;
        border: 1px solid #C43444 !important;
        box-shadow: 0 0 3px #C43444 !important;
        -moz-box-shadow: 0 0 3px #C43444 !important;
        -webkit-box-shadow: 0 0 3px #C43444 !important;
    }
`

const CommentsEmptyHeader = styled(Title)`
    margin-left: 50px;
    color: #C43444 !important;
    cursor: pointer;
    &:hover {
        text-decoration: underline;
      }
`

interface CommentSectionProps {
	comments: string;
    reloadComments: () => void;
    isLoggedIn: boolean;
}

const CommentSection = ({comments, reloadComments, isLoggedIn = true}: CommentSectionProps) => {
    let data = JSON.parse(comments);
    const router = useRouter();
    const [showCommentForm, setShowCommentForm] = useState<boolean | undefined>();
    const [form] = Form.useForm();

    // get cookies for logged in user id
    const [cookies] = useCookies(['userObj']);

    // handle comment form submission
    const submitComment = async (values: any) => {
        // only submit if comment textarea is not empty
        if (values.commentText) {
            const { eid } = router.query;
            let commentData = {
                _id: Math.floor(Math.random() * Date.now()),
                points: 1,
                createdAt: new Date(),
                text: values.commentText,
                user: cookies.userObj._id,
                comments: []
            }

            await fetch('http://localhost:2102/event?_id=' + eid, {
                method: 'PATCH', 
                headers: {
			        'Authorization': `${getToken(cookies['userObj'])}`,
                    'Content-Type': 'application/json',
	    	    },
                body: JSON.stringify({
                    commentType: "comment",
                    commentData: commentData,
                }),
            }).then(() => {
                // hide comment form
                setShowCommentForm(false);

                form.resetFields()
                // reload comment section
                reloadComments();
            });
        }
	};

    return (
        <>
            {/* Conditionally render if no comments have been made yet */}
            {(!(showCommentForm) && comments === "[]") && (
                isLoggedIn ?
                <CommentsEmptyHeader level={4} style={{marginBottom: '20px'}} onClick={() => { setShowCommentForm(true) }}>
                    Be the first to comment!
                </CommentsEmptyHeader> 
                :
                <CommentsEmptyHeader style={{pointerEvents: 'auto'}} level={4}>
                No comments yet!
            </CommentsEmptyHeader> 
            )}

            {/* Conditionally render comment form */}
            {showCommentForm ? (
                <CommentContainer>
                    <Form requiredMark={false} onFinish={submitComment} id="commentForm" form={form}>
                        {/* rules={[{ required: true, message: 'Please enter a comment' }]} */}
                        <Form.Item
                            name="commentText"
                        >
                            {/* need to use html textarea for diagonal size adjustment */}
                            {/* TODO: update border color to meetic red */}
                            <CommentTextInput rows={4} cols={50} autoFocus/>
                        </Form.Item>
                        <Space direction="horizontal" style={{marginTop: "-40px", }}>
                            <Button type="default" style={{alignItems:'center',marginTop:40}}
                                htmlType="submit">
                                <Text strong>Save</Text>
                            </Button>
                            <Button type="default" style={{alignItems:'center',marginTop:40}}
                                onClick={()=> {setShowCommentForm(false)}}>
                                <Text>Cancel</Text>
                            </Button>
                        </Space>
                    </Form>
                </CommentContainer>
            ) : (
                isLoggedIn ?
                <Button style={{marginLeft:"50px", marginBottom:"20px"}}
                onClick={() => { setShowCommentForm(true) }}>
                    Comment
                </Button>
                : 
                <Button style={{marginLeft:"50px", marginBottom:"20px"}}
                onClick={() => { router.push('/login') }}>
                    Sign in to comment
                </Button>
            )}

            {/* Render comments */}
            {data.map((comment) => (
                    <>
                        <Comment reloadComments = {() => {reloadComments()}} comment = {comment} />
                    </>
            ))}
        </>
    )
}

export default CommentSection;