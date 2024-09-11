import React, { useEffect, useState } from "react";
import { GetFriends } from "../../apis/Axios";
import FriendsCard from "../../components/Cards/FriendsCard";
import PageHeader from "../../components/PageHeader/PageHeader";
import {
  fetchMethod,
  GridContainer,
  GridItem,
  NavigateSnackbar,
  PageHeaderButton,
  PageMainBox,
} from "../../utils/Helper";
import AddFriendModal from "./Modals/AddFriend";
import RemoveFriendModal from "./Modals/RemoveFriend";

export default function Friends() {
  const [addFriend, setAddFriend] = useState({
    open: false,
  });
  const [removeFriend, setRemoveFriend] = useState({
    open: false,
    data: {},
  });
  const [friends, setFriends] = useState({
    loading: true,
    data: [],
  });

  const handleGetFriends = async () => {
    const { response } = await fetchMethod(GetFriends, setFriends);
    if (response.status) {
      setFriends((prev) => ({ ...prev, data: response.data }));
    }
  };
  useEffect(() => {
    handleGetFriends();
  }, []);
  return (
    <>
      <PageHeader title={"Friends"}>
        <PageHeaderButton
          title={"+ Add Friend"}
          onClick={() => setAddFriend((prev) => ({ ...prev, open: true }))}
        />
      </PageHeader>
      <PageMainBox>
        <GridContainer>
          <GridItem>
            <GridContainer>
              {friends.data.map((dt, index) => (
                <GridItem md={12} key={index}>
                  <FriendsCard
                    name={`${dt.firstName} ${dt.lastName}`}
                    email={dt.email}
                    src={dt.profile}
                    onClick={() => {
                      setRemoveFriend((prev) => ({
                        ...prev,
                        open: true,
                        data: dt,
                      }));
                    }}
                  />
                </GridItem>
              ))}
            </GridContainer>
          </GridItem>
        </GridContainer>
      </PageMainBox>
      <NavigateSnackbar />
      {addFriend.open && (
        <AddFriendModal
          open={addFriend.open}
          onClose={() => setAddFriend((prev) => ({ ...prev, open: false }))}
          handleGetFriends={handleGetFriends}
        />
      )}
      {removeFriend.open && (
        <RemoveFriendModal
          open={removeFriend.open}
          onClose={() => setRemoveFriend((prev) => ({ ...prev, open: false }))}
          data={removeFriend.data}
          handleGetFriends={handleGetFriends}
        />
      )}
    </>
  );
}
