import React, { useState } from "react"
import axios from "axios"

import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import "./App.css"
import { ImageCropper } from "./components"
import { resizeCrop, dataURItoBlob } from "./helper"
import {
  Progress,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Card,
  Button,
  CardTitle,
  CardText,
  Row,
  Col,
} from "reactstrap"
import classnames from "classnames"

function App() {
  const [loaded, setLoaded] = useState(0)
  const [selectedFile, setSelectedFile] = useState(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null)
  const [imageValid, setImageValid] = useState(false)
  const [userCroppedFile, setUserCroppedFile] = useState(null)
  const [croppedFiles, setCropppedFiles] = useState({
    horizontal: null,
    vertical: null,
    gallery: null,
    horizontal_small: null,
  })

  const [activeTab, setActiveTab] = useState("1")
  const toggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab)
  }

  const checkMimeType = (event) => {
    //getting file object
    let files = event.target.files
    //define message container
    let err = ""
    // list allow mime type
    const types = ["image/png", "image/jpeg", "image/gif"]

    // compare file type find doesn't match
    if (types.every((type) => files[0].type !== type)) {
      err = files[0].type + " is not a supported format\n"
      toast.error(err)
      event.target.value = null
      return false
    }
    return true
  }

  const checkFileSize = (event) => {
    let files = event.target.files
    let size = 2000000
    let err = ""
    if (files[0].size > size) {
      err = files[0].type + "is too large, please pick a smaller file\n"
      toast.error(err)
      event.target.value = null
      return false
    }
    return true
  }

  const onChangeHandler = (event) => {
    const img = new Image()
    const reader = new FileReader()
    const files = event.target.files[0]

    if (checkMimeType(event) && checkFileSize(event)) {
      // if return true allow to setState
      setSelectedFile(files)
      setLoaded(0)
      reader.onloadend = (ended) => {
        setImagePreviewUrl(ended.target.result)
        img.src = ended.target.result
      }
      reader.readAsDataURL(event.target.files[0])
      img.onload = function (e) {
        if (this.width === 1024 && this.height === 1024) {
          setImageValid(true)
          const horizontal = resizeCrop(e.target, 755, 450).toDataURL("image/jpg")
          const vertical = resizeCrop(e.target, 365, 420).toDataURL("image/png")
          const horizontal_small = resizeCrop(e.target, 365, 212).toDataURL("image/png")
          const gallery = resizeCrop(e.target, 380, 380).toDataURL("image/png")
          setCropppedFiles({ ...croppedFiles, horizontal, vertical, horizontal_small, gallery })
        } else {
          setImageValid(false)
          toast.error("Image is not of Dimension 1024X1024")
        }
      }
    }
  }

  const onClickHandler = () => {
    if (selectedFile) {
      const data = new FormData()
      const files = []
      for (const keys in croppedFiles) {
        const blob = dataURItoBlob(croppedFiles[keys])
        const file = new File([blob], `${keys}.jpg`, { type: "image/jpeg" })
        files.push(file)
      }
      for (let x = 0; x < files.length; x++) {
        data.append("file", files[x])
      }
      sendData(data)
    } else {
      toast.error("please upload image first")
    }
  }

  const onCustomClickHandler = () => {
    if (userCroppedFile) {
      const data = new FormData()
      const files = []

      const blob = dataURItoBlob(userCroppedFile)
      const file = new File([blob], `userCustomCrop.jpg`, { type: "image/jpeg" })
      files.push(file)

      for (let x = 0; x < files.length; x++) {
        data.append("file", files[x])
      }
      sendData(data)
    } else {
      toast.error("please upload image first")
    }
  }

  const sendData = (data) => {
    axios
      .post("http://localhost:8000/upload", data, {
        onUploadProgress: (ProgressEvent) => {
          setLoaded((ProgressEvent.loaded / ProgressEvent.total) * 100)
        },
      })
      .then((res) => {
        // then print response status
        toast.success("upload success")
      })
      .catch((err) => {
        // then print response status
        toast.error("upload fail")
      })
  }

  const onCropChange = (url) => {
    setUserCroppedFile(url)
  }
  let $imagePreview = null
  if (imagePreviewUrl && imageValid) {
    $imagePreview = <ImageCropper src={imagePreviewUrl} onCropChange={onCropChange} />
  }

  return (
    <div className="container">
      <div className="row">
        <div className="offset-md-3 col-md-6">
          <div className="form-group files">
            <label>Upload Your File </label>
            <input type="file" className="form-control" onChange={onChangeHandler} />
          </div>
          <div className="form-group">
            <ToastContainer />
            <Progress max="100" color="success" value={loaded}>
              {Math.round(loaded, 2)}%
            </Progress>
          </div>

          <button type="button" className="btn btn-success btn-block" onClick={onClickHandler}>
            Upload Default Crop Sizes
          </button>
          <button type="button" className="btn btn-success btn-block" onClick={onCustomClickHandler}>
            Upload Custom Crop Sizes
          </button>
        </div>
      </div>
      <div className="row">{$imagePreview}</div>
      <div className="row">
        <Nav tabs>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === "1" })}
              onClick={() => {
                toggle("1")
              }}
            >
              Horizontal
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === "2" })}
              onClick={() => {
                toggle("2")
              }}
            >
              Vertical
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === "3" })}
              onClick={() => {
                toggle("3")
              }}
            >
              Horizontal Small
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === "4" })}
              onClick={() => {
                toggle("4")
              }}
            >
              Gallery
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={activeTab}>
          <TabPane tabId="1">
            <Row>
              <Col sm="12">
                <img src={croppedFiles.horizontal} />
              </Col>
            </Row>
          </TabPane>
          <TabPane tabId="2">
            <Row>
              <Col sm="12">
                <img src={croppedFiles.vertical} />
              </Col>
            </Row>
          </TabPane>
          <TabPane tabId="3">
            <Row>
              <Col sm="12">
                <img src={croppedFiles.horizontal_small} />
              </Col>
            </Row>
          </TabPane>
          <TabPane tabId="4">
            <Row>
              <Col sm="12">
                <img src={croppedFiles.gallery} />
              </Col>
            </Row>
          </TabPane>
        </TabContent>
      </div>
    </div>
  )
}

export default App
