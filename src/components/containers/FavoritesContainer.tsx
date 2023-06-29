import dynamic from "next/dynamic";
import React, { useState } from "react";
import { api } from "~/utils/api";
import TextRenderer from "../modules/textEditor/TextRenderer";
import { useRouter } from "next/router";

const Button = dynamic(() => import("~/components/modules/button/Button"), {
  ssr: false,
});

// TODO refactor with entries containers

const FavoritesContainer = () => {
  const router = useRouter();
  const { currentUser: userName } = router.query as {
    currentUser: string;
  };
  const { data } = api.entry.getFavorites.useQuery({
    userName: userName,
  });
  const [showMore, setShowMore] = useState(5);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const newValue = e.currentTarget.innerText;
    if (newValue === "show all" && data) {
      setShowMore(data.length);
    } else {
      setShowMore(5);
    }
  };

  return (
    <div className="">
      {data &&
        data
          .slice(0, showMore)
          .map((el) => <TextRenderer key={el.id} {...el} />)}
      {data && data.length > 0 ? (
        <div
          className={
            data.length > 10 ? " flex items-center justify-center" : "hidden"
          }
        >
          <Button
            onClick={(e) => {
              handleClick(e);
            }}
            className="w-40"
            size="tiny"
            type="primary"
          >
            {showMore == 5 ? "show all" : "show less"}
          </Button>
        </div>
      ) : (
        <p className="text-typography-body-light dark:text-typography-body-dark">
          there is empty
        </p>
      )}
    </div>
  );
};

export default FavoritesContainer;
2;
